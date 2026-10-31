import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { UserModel } from '../models/User.model';
import { CustomerModel } from '../models/Customer.model';
import { ProductModel } from '../models/Product.model';
import { PlanModel } from '../models/Plan.model';
import { TaxRateModel } from '../models/TaxRate.model';
import { DiscountModel } from '../models/Discount.model';
import { QuotationModel } from '../models/Quotation.model';
import { SubscriptionModel } from '../models/Subscription.model';
import { InvoiceModel } from '../models/Invoice.model';
import { PaymentModel } from '../models/Payment.model';
import { NotificationModel } from '../models/Notification.model';
import { UserRole, BillingInterval, SubscriptionStatus, InvoiceStatus, PaymentMethod, PaymentStatus, QuotationStatus, DiscountType, NotificationChannel } from '../types/roles';
import { logger } from '../utils/logger';

export const seedDatabase = async () => {
  logger.info('--- Commencing Database Seeding ---');

  // Clear existing collections
  await Promise.all([
    UserModel.deleteMany({}),
    CustomerModel.deleteMany({}),
    ProductModel.deleteMany({}),
    PlanModel.deleteMany({}),
    TaxRateModel.deleteMany({}),
    DiscountModel.deleteMany({}),
    QuotationModel.deleteMany({}),
    SubscriptionModel.deleteMany({}),
    InvoiceModel.deleteMany({}),
    PaymentModel.deleteMany({}),
    NotificationModel.deleteMany({}),
  ]);

  logger.info('Cleared existing collections.');

  // 1. Create Tax Rates
  const [taxUs, taxEu] = await Promise.all([
    TaxRateModel.create({
      name: 'US Sales Tax (CA)',
      jurisdiction: 'US-CA',
      percentage: 8.25,
      isInclusive: false,
      active: true,
    }),
    TaxRateModel.create({
      name: 'EU Digital VAT',
      jurisdiction: 'EU',
      percentage: 20.0,
      isInclusive: true,
      active: true,
    }),
  ]);

  // 2. Create Discounts
  const [discountWelcome, discountStartup] = await Promise.all([
    DiscountModel.create({
      code: 'WELCOME20',
      description: '20% off introductory coupon',
      type: DiscountType.PERCENTAGE,
      value: 20,
      maxRedemptions: 100,
      timesRedeemed: 3,
      validFrom: new Date(),
      active: true,
    }),
    DiscountModel.create({
      code: 'STARTUP50',
      description: '$50 flat off for new founders',
      type: DiscountType.FIXED,
      value: 50,
      maxRedemptions: 50,
      timesRedeemed: 1,
      validFrom: new Date(),
      active: true,
    }),
  ]);

  // 3. Create Products
  const [productCloud, productApi] = await Promise.all([
    ProductModel.create({
      name: 'SubFlow Cloud SaaS Platform',
      description: 'Complete centralized subscription billing & recurring revenue engine',
      sku: 'SUBFLOW-CORE',
      category: 'Cloud Software',
      active: true,
      features: ['Automated Invoicing', 'Customer Portal', 'Analytics Dashboard', 'Audit Logging'],
    }),
    ProductModel.create({
      name: 'Enterprise API & Dedicated Gateway',
      description: 'High-throughput billing API with 99.99% uptime SLA',
      sku: 'SUBFLOW-API-GW',
      category: 'Developer Tools',
      active: true,
      features: ['Dedicated IP', 'Unlimited Webhooks', 'Priority Queue', 'Custom Integrations'],
    }),
  ]);

  // 4. Create Plans
  const [planStarter, planPro, planEnterprise, planProYearly] = await Promise.all([
    PlanModel.create({
      productId: productCloud._id,
      code: 'STARTER-MONTHLY',
      name: 'Starter Plan',
      description: 'Essential billing for early-stage companies and startups',
      billingInterval: BillingInterval.MONTHLY,
      price: 29.0,
      currency: 'USD',
      trialPeriodDays: 14,
      active: true,
      features: ['Up to 100 subscribers', 'Standard Email Support', 'Basic Reports'],
    }),
    PlanModel.create({
      productId: productCloud._id,
      code: 'PRO-MONTHLY',
      name: 'Professional Plan',
      description: 'Full-featured recurring billing automation for scaleups',
      billingInterval: BillingInterval.MONTHLY,
      price: 99.0,
      currency: 'USD',
      trialPeriodDays: 0,
      active: true,
      features: ['Up to 2,500 subscribers', 'Priority Support', 'Full Analytics', 'PDF Generation'],
    }),
    PlanModel.create({
      productId: productCloud._id,
      code: 'ENTERPRISE-MONTHLY',
      name: 'Enterprise Plan',
      description: 'Mission-critical billing infrastructure with tailored SLAs',
      billingInterval: BillingInterval.MONTHLY,
      price: 299.0,
      currency: 'USD',
      trialPeriodDays: 0,
      active: true,
      features: ['Unlimited subscribers', '24/7 Phone Support', 'Custom Tax Rules', 'Dedicated Manager'],
    }),
    PlanModel.create({
      productId: productCloud._id,
      code: 'PRO-YEARLY',
      name: 'Professional Plan (Annual)',
      description: 'Professional tier with 2 months free',
      billingInterval: BillingInterval.YEARLY,
      price: 990.0,
      currency: 'USD',
      trialPeriodDays: 0,
      active: true,
      features: ['All Pro features', '2 Months Free', 'Annual Invoicing'],
    }),
  ]);

  // 5. Create Customers
  const [customerAcme, customerGlobex, customerInitech] = await Promise.all([
    CustomerModel.create({
      customerCode: 'CUST-0001',
      name: 'Acme Corporation',
      companyName: 'Acme Corp Inc.',
      email: 'acme.billing@acmecorp.com',
      phone: '+1 415-555-0101',
      billingAddress: {
        street: '123 Market Street, Floor 14',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'US',
      },
      currency: 'USD',
      status: 'ACTIVE',
      balance: 0,
    }),
    CustomerModel.create({
      customerCode: 'CUST-0002',
      name: 'Globex Corporation',
      companyName: 'Globex Industries',
      email: 'finance@globex.com',
      phone: '+1 212-555-0199',
      billingAddress: {
        street: '456 Lexington Ave',
        city: 'New York',
        state: 'NY',
        postalCode: '10017',
        country: 'US',
      },
      currency: 'USD',
      status: 'ACTIVE',
      balance: 299.0,
    }),
    CustomerModel.create({
      customerCode: 'CUST-0003',
      name: 'Initech Software LLC',
      companyName: 'Initech LLC',
      email: 'peter.gibbons@initech.com',
      phone: '+1 512-555-0144',
      billingAddress: {
        street: '4120 Freidrich Ln',
        city: 'Austin',
        state: 'TX',
        postalCode: '78744',
        country: 'US',
      },
      currency: 'USD',
      status: 'ACTIVE',
      balance: 0,
    }),
  ]);

  // 6. Create Users (Admin, Staff, Customer logins)
  const [userAdmin, userStaff, userCustomer] = await Promise.all([
    UserModel.create({
      email: 'admin@subflow.io',
      password: 'AdminPassword123!',
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.ADMIN,
      isActive: true,
    }),
    UserModel.create({
      email: 'staff@subflow.io',
      password: 'StaffPassword123!',
      firstName: 'Operations',
      lastName: 'Manager',
      role: UserRole.STAFF,
      isActive: true,
    }),
    UserModel.create({
      email: 'acme.billing@acmecorp.com',
      password: 'CustomerPassword123!',
      firstName: 'Alice',
      lastName: 'Acme',
      role: UserRole.CUSTOMER,
      customerId: customerAcme._id,
      isActive: true,
    }),
  ]);

  // Link customer to user
  customerAcme.userId = userCustomer._id as any;
  await customerAcme.save();

  // 7. Create Subscriptions
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const [subAcme, subGlobex, subInitech] = await Promise.all([
    SubscriptionModel.create({
      subscriptionNumber: 'SUB-2026-0001',
      customerId: customerAcme._id,
      planId: planPro._id,
      quantity: 1,
      billingInterval: BillingInterval.MONTHLY,
      unitPrice: 99.0,
      currency: 'USD',
      taxRateId: taxUs._id,
      status: SubscriptionStatus.ACTIVE,
      startDate: now,
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth,
      autoRenew: true,
    }),
    SubscriptionModel.create({
      subscriptionNumber: 'SUB-2026-0002',
      customerId: customerGlobex._id,
      planId: planEnterprise._id,
      quantity: 1,
      billingInterval: BillingInterval.MONTHLY,
      unitPrice: 299.0,
      currency: 'USD',
      taxRateId: taxUs._id,
      status: SubscriptionStatus.ACTIVE,
      startDate: now,
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth,
      autoRenew: true,
    }),
    SubscriptionModel.create({
      subscriptionNumber: 'SUB-2026-0003',
      customerId: customerInitech._id,
      planId: planStarter._id,
      quantity: 1,
      billingInterval: BillingInterval.MONTHLY,
      unitPrice: 29.0,
      currency: 'USD',
      status: SubscriptionStatus.TRIALING,
      startDate: now,
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth,
      trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      autoRenew: true,
    }),
  ]);

  // 8. Create Invoices
  // Invoice 1: Acme Corp - Paid
  const invAcmeDueDate = new Date(now);
  invAcmeDueDate.setDate(invAcmeDueDate.getDate() + 15);

  const invAcme = await InvoiceModel.create({
    invoiceNumber: 'INV-2026-0001',
    customerId: customerAcme._id,
    subscriptionId: subAcme._id,
    items: [
      {
        description: 'Professional Plan (Monthly)',
        planId: planPro._id,
        quantity: 1,
        unitPrice: 99.0,
        amount: 99.0,
      },
    ],
    subtotal: 99.0,
    taxRateId: taxUs._id,
    taxAmount: 8.17,
    totalAmount: 107.17,
    amountPaid: 107.17,
    amountDue: 0,
    currency: 'USD',
    issueDate: now,
    dueDate: invAcmeDueDate,
    paidAt: now,
    status: InvoiceStatus.PAID,
    notes: 'Thank you for choosing SubFlow.',
  });

  subAcme.latestInvoiceId = invAcme._id as any;
  await subAcme.save();

  // Invoice 2: Globex Corp - Open
  const invGlobexDueDate = new Date(now);
  invGlobexDueDate.setDate(invGlobexDueDate.getDate() + 7);

  const invGlobex = await InvoiceModel.create({
    invoiceNumber: 'INV-2026-0002',
    customerId: customerGlobex._id,
    subscriptionId: subGlobex._id,
    items: [
      {
        description: 'Enterprise Plan (Monthly)',
        planId: planEnterprise._id,
        quantity: 1,
        unitPrice: 299.0,
        amount: 299.0,
      },
    ],
    subtotal: 299.0,
    discountAmount: 0,
    taxAmount: 0,
    totalAmount: 299.0,
    amountPaid: 0,
    amountDue: 299.0,
    currency: 'USD',
    issueDate: now,
    dueDate: invGlobexDueDate,
    status: InvoiceStatus.OPEN,
    notes: 'Payment net 7 days.',
  });

  subGlobex.latestInvoiceId = invGlobex._id as any;
  await subGlobex.save();

  // 9. Create Payments
  await PaymentModel.create({
    paymentNumber: 'PAY-2026-0001',
    customerId: customerAcme._id,
    invoiceId: invAcme._id,
    amount: 107.17,
    currency: 'USD',
    paymentMethod: PaymentMethod.CREDIT_CARD,
    status: PaymentStatus.SUCCESS,
    transactionReference: 'TXN-ACME-99182',
    paymentDate: now,
    notes: 'Auto-charged corporate Visa ending in 4242',
    recordedBy: userAdmin._id as any,
  });

  // 10. Create Quotations
  const quoteExpiry = new Date(now);
  quoteExpiry.setDate(quoteExpiry.getDate() + 30);

  await QuotationModel.create({
    quotationNumber: 'QUO-2026-0001',
    customerId: customerAcme._id,
    items: [
      {
        description: 'Enterprise API Gateway Addon',
        planId: planEnterprise._id,
        unitPrice: 199.0,
        quantity: 2,
        subtotal: 398.0,
      },
    ],
    subtotal: 398.0,
    discountId: discountWelcome._id,
    discountAmount: 79.6,
    totalAmount: 318.4,
    currency: 'USD',
    validUntil: quoteExpiry,
    status: QuotationStatus.SENT,
    notes: 'Special expansion quote for Acme Corporation.',
  });

  // 11. Create Notifications
  await NotificationModel.create({
    recipientId: customerAcme._id,
    recipientEmail: customerAcme.email,
    title: 'Payment Confirmation for INV-2026-0001',
    message: 'We received your payment of $107.17. Thank you for your business!',
    type: 'PAYMENT',
    channel: NotificationChannel.IN_APP,
    isRead: false,
    sentAt: now,
  });

  logger.info('--- Seeding Completed Successfully! ---');
  logger.info('Demo Credentials:');
  logger.info('  Admin:    admin@subflow.io / AdminPassword123!');
  logger.info('  Staff:    staff@subflow.io / StaffPassword123!');
  logger.info('  Customer: acme.billing@acmecorp.com / CustomerPassword123!');
};

// If executed directly from CLI
if (require.main === module) {
  connectDatabase()
    .then(async () => {
      await seedDatabase();
      await disconnectDatabase();
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Seeding error:', err);
      process.exit(1);
    });
}

