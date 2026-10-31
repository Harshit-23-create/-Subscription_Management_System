import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { seedDatabase } from '../src/scripts/seed';

describe('Subscription Management API End-to-End Tests', () => {
  let app: any;
  let adminToken: string;
  let customerToken: string;
  let createdCustomerId: string;
  let proPlanId: string;
  let subscriptionId: string;
  let invoiceId: string;
  let quotationId: string;
  let paymentId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDatabase();
    await seedDatabase();
    app = createApp();
  }, 30000);

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('Health & Root Endpoints', () => {
    it('GET /health returns status UP', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
    });

    it('GET / returns API welcome and docs link', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.documentation).toBe('/api/docs');
    });

    it('GET /api/openapi.json serves OpenAPI 3.1 specification', async () => {
      const res = await request(app).get('/api/openapi.json');
      expect(res.status).toBe(200);
      expect(res.body.openapi).toBe('3.1.0');
      expect(res.body.info.title).toBe('Subscription Management System API');
    });
  });

  describe('Authentication & Roles', () => {
    it('POST /api/v1/auth/login logs in admin with valid credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@subflow.io',
        password: 'AdminPassword123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.role).toBe('ADMIN');
      adminToken = res.body.data.accessToken;
    });

    it('POST /api/v1/auth/login logs in customer user', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'acme.billing@acmecorp.com',
        password: 'CustomerPassword123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('CUSTOMER');
      expect(res.body.data.user.customerId).toBeDefined();
      customerToken = res.body.data.accessToken;
    });

    it('POST /api/v1/auth/login fails with invalid password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@subflow.io',
        password: 'WrongPassword!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/auth/profile returns profile for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('admin@subflow.io');
    });
  });

  describe('Customer Management', () => {
    it('POST /api/v1/customers creates a new customer (Admin)', async () => {
      const res = await request(app)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Wayne Enterprises',
          email: 'bruce@wayneenterprises.com',
          companyName: 'Wayne Enterprises Global',
          phone: '+1 212-555-0188',
          currency: 'USD',
          billingAddress: {
            street: '1007 Mountain Drive',
            city: 'Gotham',
            state: 'NJ',
            country: 'US',
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customerCode).toMatch(/^CUST-\d+/);
      createdCustomerId = res.body.data._id;
    });

    it('GET /api/v1/customers lists customers with search & pagination', async () => {
      const res = await request(app)
        .get('/api/v1/customers?search=Wayne')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].name).toBe('Wayne Enterprises');
    });

    it('GET /api/v1/customers/:id returns customer and financial summary', async () => {
      const res = await request(app)
        .get(`/api/v1/customers/${createdCustomerId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.customer.email).toBe('bruce@wayneenterprises.com');
      expect(res.body.data.summary).toBeDefined();
    });
  });

  describe('Plans & Subscriptions Lifecycle', () => {
    it('GET /api/v1/plans lists public plans', async () => {
      const res = await request(app).get('/api/v1/plans');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      const proPlan = res.body.data.find((p: any) => p.code === 'PRO-MONTHLY');
      expect(proPlan).toBeDefined();
      proPlanId = proPlan._id;
    });

    it('POST /api/v1/subscriptions creates subscription and generates initial invoice', async () => {
      const res = await request(app)
        .post('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: createdCustomerId,
          planId: proPlanId,
          quantity: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('ACTIVE');
      expect(res.body.data.subscriptionNumber).toMatch(/^SUB-\d+/);
      expect(res.body.data.latestInvoiceId).toBeDefined();
      subscriptionId = res.body.data._id;
      invoiceId = res.body.data.latestInvoiceId;
    });

    it('POST /api/v1/subscriptions/:id/pause pauses subscription', async () => {
      const res = await request(app)
        .post(`/api/v1/subscriptions/${subscriptionId}/pause`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('PAUSED');
    });

    it('POST /api/v1/subscriptions/:id/resume resumes paused subscription', async () => {
      const res = await request(app)
        .post(`/api/v1/subscriptions/${subscriptionId}/resume`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('ACTIVE');
    });

    it('POST /api/v1/subscriptions/:id/renew advances billing period and creates next invoice', async () => {
      const res = await request(app)
        .post(`/api/v1/subscriptions/${subscriptionId}/renew`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.latestInvoiceId).toBeDefined();
      expect(res.body.data.latestInvoiceId).not.toBe(invoiceId);
    });
  });

  describe('Invoices, Payments & PDF Generation', () => {
    it('GET /api/v1/invoices/:id retrieves invoice details', async () => {
      const res = await request(app)
        .get(`/api/v1/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.invoiceNumber).toMatch(/^INV-\d+/);
      expect(res.body.data.amountDue).toBe(99.0);
    });

    it('GET /api/v1/invoices/:id/pdf generates downloadable PDF stream', async () => {
      const res = await request(app)
        .get(`/api/v1/invoices/${invoiceId}/pdf`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.body.length).toBeGreaterThan(100);
    });

    it('POST /api/v1/payments records partial payment against invoice', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: createdCustomerId,
          invoiceId: invoiceId,
          amount: 50.0,
          paymentMethod: 'CREDIT_CARD',
          notes: 'Partial payment on account',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('SUCCESS');
      paymentId = res.body.data._id;

      // Verify invoice balance updated
      const invCheck = await request(app)
        .get(`/api/v1/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(invCheck.body.data.amountPaid).toBe(50.0);
      expect(invCheck.body.data.amountDue).toBe(49.0);
      expect(invCheck.body.data.status).toBe('OPEN');
    });

    it('POST /api/v1/payments settles invoice in full', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: createdCustomerId,
          invoiceId: invoiceId,
          amount: 49.0,
          paymentMethod: 'BANK_TRANSFER',
          transactionReference: 'WIRE-12345',
        });

      expect(res.status).toBe(201);

      // Verify invoice marked as PAID
      const invCheck = await request(app)
        .get(`/api/v1/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(invCheck.body.data.amountPaid).toBe(99.0);
      expect(invCheck.body.data.amountDue).toBe(0);
      expect(invCheck.body.data.status).toBe('PAID');
    });

    it('GET /api/v1/payments/:id/receipt generates PDF receipt', async () => {
      const res = await request(app)
        .get(`/api/v1/payments/${paymentId}/receipt`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
    });
  });

  describe('Quotations Management & Conversion', () => {
    it('POST /api/v1/quotations creates quotation with calculated totals', async () => {
      const res = await request(app)
        .post('/api/v1/quotations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: createdCustomerId,
          items: [
            {
              description: 'Custom Onboarding Package',
              unitPrice: 500.0,
              quantity: 1,
            },
          ],
          validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          terms: 'Standard net 30 payment terms.',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.quotationNumber).toMatch(/^QUO-\d+/);
      expect(res.body.data.totalAmount).toBe(500.0);
      quotationId = res.body.data._id;
    });

    it('GET /api/v1/quotations/:id/pdf generates quotation PDF', async () => {
      const res = await request(app)
        .get(`/api/v1/quotations/${quotationId}/pdf`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
    });

    it('POST /api/v1/quotations/:id/convert-to-invoice converts quote directly to invoice', async () => {
      const res = await request(app)
        .post(`/api/v1/quotations/${quotationId}/convert-to-invoice`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(201);
      expect(res.body.data.quotationId).toBe(quotationId);
      expect(res.body.data.totalAmount).toBe(500.0);
    });
  });

  describe('Analytics & Reports', () => {
    it('GET /api/v1/analytics/summary returns accurate MRR, ARR and KPIs', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.kpis.mrr).toBeGreaterThan(0);
      expect(res.body.data.kpis.arr).toBeGreaterThan(0);
      expect(res.body.data.counts.totalCustomers).toBeGreaterThan(0);
    });

    it('GET /api/v1/analytics/revenue returns revenue report', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/revenue')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Customer Portal & Audit Trail', () => {
    it('GET /api/v1/portal/dashboard returns customer account dashboard', async () => {
      const res = await request(app)
        .get('/api/v1/portal/dashboard')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.customer).toBeDefined();
      expect(res.body.data.subscriptions).toBeDefined();
    });

    it('GET /api/v1/audit-logs returns system audit trail (Admin only)', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});
