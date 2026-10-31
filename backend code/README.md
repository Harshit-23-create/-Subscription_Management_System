# Enterprise Subscription Management & Billing Backend API

A production-ready, fully functional RESTful backend system built with **Node.js, TypeScript, Express.js, MongoDB / Mongoose, Zod, and OpenAPI 3.1**. It manages customers, subscription plans, subscriptions, quotations, invoices, payments, taxes, discounts, customer self-service portal, real-time analytics (MRR/ARR), audit logging, and automated recurring billing jobs.

---

## Architecture & Technology Stack

- **Runtime:** Node.js (v20+ / v26 LTS)
- **Language:** TypeScript with strict type checking
- **Framework:** Express.js (v5)
- **Database & ODM:** MongoDB Atlas / Local MongoDB with Mongoose
  - *Zero-setup dev mode:* Built-in automatic fallback to `mongodb-memory-server` when local MongoDB is not running, allowing instant execution on any developer machine without pre-configuration.
- **Request Validation & Schemas:** Zod
- **Authentication & Security:** JWT (JSON Web Tokens), bcryptjs password hashing, Helmet security headers, CORS protection, correlation IDs (`X-Request-Id`).
- **Authorization:** Role-Based Access Control (`ADMIN`, `STAFF`, `CUSTOMER`) with customer resource ownership isolation.
- **PDF Generation Engine:** PDFKit with corporate invoice, quotation, and receipt designs.
- **API Documentation:** Interactive Swagger UI (`/api/docs`) and OpenAPI 3.1 specification (`/api/openapi.json`).
- **Testing:** Vitest with Supertest integration test suite (31 automated unit & end-to-end tests).

```
                            ┌───────────────────────────────────┐
                            │    Client (SPA / Mobile App)      │
                            └─────────────────┬─────────────────┘
                                              │ HTTP / JSON
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    EXPRESS BACKEND                                      │
│                                                                                         │
│  [Helmet / CORS / Request ID] ──▶ [Auth Middleware (JWT)] ──▶ [RBAC / Tenant Guard]     │
│                                                                        │                │
│  [Zod Validation] ◀────────────────────────────────────────────────────┘                │
│          │                                                                              │
│          ▼                                                                              │
│  [Resource Controllers] (Auth, Customers, Plans, Quotes, Subscriptions, Invoices, etc.) │
│          │                                                                              │
│          ▼                                                                              │
│  [Service Layer] (Financial Calculations, Subscription State Machine, PDFKit Engine)    │
│          │                                                                              │
│          ▼                                                                              │
│  [Mongoose ODM Models] ──▶ [MongoDB Atlas / Local / In-Memory Fallback]                 │
│                                                                                         │
│  [Background Scheduler] ── Auto-Renewals, Trial Expiry, Period Cancellation, Overdue    │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Features & Business Logic

### 1. Authentication & Role-Based Access Control (RBAC)
- **Roles:**
  - `ADMIN`: Full system configuration, product/plan pricing, financial rules, user management, and executive analytics.
  - `STAFF`: Day-to-day operations: customer support, quotation management, subscription adjustments, invoice management, recording payments.
  - `CUSTOMER`: Self-service portal: view own subscriptions, invoices, payment history, and download PDF receipts.
- **Security:** Passwords salted & hashed with `bcryptjs`, signed JWT access & refresh tokens, request-level authorization guards.

### 2. Customer Management
- Automated customer code generation (`CUST-0001`, `CUST-0002`).
- Billing and shipping address models, tax IDs, multi-currency support.
- Real-time outstanding balance calculation linked to unpaid invoices.
- Full-text search and filtering by status (`ACTIVE`, `SUSPENDED`, `ARCHIVED`).

### 3. Product & Subscription Plan Engine
- Product catalog with SKU, category, and feature checklists.
- Flexible subscription plans with billing intervals (`WEEKLY`, `MONTHLY`, `QUARTERLY`, `YEARLY`).
- Free trial support (`trialPeriodDays`) with automated conversion on trial end.

### 4. Quotation Management
- Create quotes with multiple line items, discount codes, and tax rates.
- Quote lifecycle: `DRAFT` ➔ `SENT` ➔ `ACCEPTED` / `REJECTED` / `EXPIRED` ➔ `CONVERTED`.
- 1-click conversion directly from accepted Quotation to official Invoice or Subscription.
- Professional vector PDF generation for quotations (`GET /api/v1/quotations/:id/pdf`).

### 5. Subscription Lifecycle State Machine
- Lifecycle states: `TRIALING`, `ACTIVE`, `PAUSED`, `PAST_DUE`, `CANCELED`, `EXPIRED`.
- Operations:
  - **Create:** Computes period start and end dates; automatically generates first billing invoice (unless in trial).
  - **Renew:** Advances billing period and creates next recurring invoice.
  - **Pause & Resume:** Suspends billing cycle and restores active status.
  - **Cancel:** Supports immediate cancellation or graceful `cancelAtPeriodEnd`.
  - **Plan Upgrades/Downgrades:** Swaps tier pricing and billing interval.

### 6. Billing & Invoicing
- Sequential invoice numbering (`INV-2026-0001`).
- Accurate 2-decimal financial calculation preventing floating point roundoff errors (`subtotal`, `discountAmount`, `taxAmount`, `totalAmount`, `amountPaid`, `amountDue`).
- Automated invoice statuses: `DRAFT`, `OPEN`, `PAID`, `UNCOLLECTIBLE`, `VOID`.
- High-resolution corporate PDF invoice generation (`GET /api/v1/invoices/:id/pdf`).

### 7. Payments & Receipts
- Multiple payment methods: `CREDIT_CARD`, `BANK_TRANSFER`, `CASH`, `STRIPE_MOCK`.
- Tracks partial payments and multiple installments towards an invoice.
- Automatically marks invoices as `PAID` once `amountDue == 0`.
- Supports partial and full refunds with balance adjustments.
- Instant PDF payment receipt generation (`GET /api/v1/payments/:id/receipt`).

### 8. Discounts & Tax Rules
- Discount coupons supporting `PERCENTAGE` or `FIXED` amount discounts.
- Expiration dates and redemption caps (`maxRedemptions`).
- Tax rates supporting tax-exclusive and tax-inclusive calculations (e.g. EU VAT vs US Sales Tax).

### 9. Customer Self-Service Portal (`/api/v1/portal`)
- Authenticated endpoints where customer users can:
  - View executive account summary (active plans, open balance, recent payments).
  - List all their subscriptions and statuses.
  - List and download official PDF invoices.
  - View verified payment history.

### 10. Executive Analytics & Dashboard (`/api/v1/analytics`)
- **Key Performance Indicators (KPIs):**
  - **MRR (Monthly Recurring Revenue):** Normalized across weekly, monthly, quarterly, and annual intervals.
  - **ARR (Annual Recurring Revenue):** Annual run-rate projection.
  - **Active Subscribers:** Real-time count of active vs trialing vs paused accounts.
  - **Churn Rate (%):** Proportion of canceled subscriptions.
  - **Revenue Over Time:** Aggregated periodic gross and net revenue trends.
  - **Overdue Invoices & Aging Balances:** Total outstanding accounts receivable.

### 11. Automated Background Scheduler (`src/jobs/scheduler.ts`)
- Cron-like interval runner for hands-off recurring operations:
  - Auto-renews expiring active subscriptions and issues new invoices.
  - Converts ending trial subscriptions to active billing.
  - Finalizes subscriptions scheduled for period-end cancellation.
  - Automatically flags expired quotations.

### 12. Audit Trail & Notifications
- Centralized immutable audit log tracking: actor, role, action, entity, IP address, user agent, and timestamp.
- In-app notification engine with simulated email notifications for billing events.

---

## Getting Started

### Prerequisites
- Node.js v20+ or v26+
- npm v10+
- *(Optional)* MongoDB Atlas connection string or local MongoDB (the server will automatically start an in-memory database if no local MongoDB instance is running).

### 1. Installation
```bash
git clone <repository-url>
cd "backend code"
npm install
```

### 2. Environment Configuration
Inspect or modify `.env` (a ready-to-run `.env` is already created):
```ini
PORT=5000
NODE_ENV=development
API_PREFIX=/api/v1
MONGODB_URI=mongodb://localhost:27017/subscription_management
AUTO_MEMORY_DB=true
JWT_SECRET=production_ready_jwt_super_secret_subscription_flow_key_987654321
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
ENABLE_CRON_JOBS=true
CRON_INTERVAL_MS=60000
```

### 3. Seed Realistic Demo Data
Populate the database with demo users, customers, products, plans, taxes, discounts, active subscriptions, invoices, and payments:
```bash
npm run seed
```

**Default Demo Credentials:**
| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin@subflow.io` | `AdminPassword123!` | Complete administrative access |
| **Staff** | `staff@subflow.io` | `StaffPassword123!` | Customer, billing, and operational management |
| **Customer** | `acme.billing@acmecorp.com` | `CustomerPassword123!` | Customer self-service portal |

### 4. Run Development Server
```bash
npm run dev
```
The server will start at: `http://localhost:5000`  
Interactive Swagger API documentation: `http://localhost:5000/api/docs`  
OpenAPI JSON Schema: `http://localhost:5000/api/openapi.json`

### 5. Run Automated Tests
Execute the comprehensive test suite (31 tests):
```bash
npm test
```

### 6. Build & Production Run
```bash
npm run build
npm start
```

### 7. Run with Docker Compose
```bash
docker compose up --build
```

---

## API Endpoints Overview

### Authentication (`/api/v1/auth`)
- `POST /register` — Register a new account
- `POST /login` — Authenticate and receive JWT tokens
- `POST /refresh-token` — Rotate JWT tokens
- `GET /profile` — Get current user profile *(Bearer Auth)*
- `POST /change-password` — Change password *(Bearer Auth)*
- `GET /users` — List system users *(Admin)*

### Customers (`/api/v1/customers`)
- `POST /` — Create a new customer *(Admin/Staff)*
- `GET /` — List and search customers *(Admin/Staff)*
- `GET /:id` — Get customer profile and financial summary *(Admin/Staff)*
- `PUT /:id` — Update customer details *(Admin/Staff)*

### Products & Plans (`/api/v1/products`, `/api/v1/plans`)
- `GET /products` / `GET /products/:id` — View product catalog
- `POST /products` / `PUT /products/:id` — Manage products *(Admin/Staff)*
- `GET /plans` / `GET /plans/:id` — View subscription tiers
- `POST /plans` / `PUT /plans/:id` — Manage plans *(Admin/Staff)*

### Quotations (`/api/v1/quotations`)
- `POST /` — Create formal quotation *(Admin/Staff)*
- `GET /` — List quotations *(Admin/Staff)*
- `GET /:id` — Get quotation details
- `PATCH /:id/status` — Update quote status (`SENT`, `ACCEPTED`, `REJECTED`)
- `POST /:id/convert-to-invoice` — Convert quotation to invoice *(Admin/Staff)*
- `GET /:id/pdf` — Download quotation PDF

### Subscriptions (`/api/v1/subscriptions`)
- `POST /` — Create subscription *(Admin/Staff)*
- `GET /` — List and filter subscriptions *(Admin/Staff)*
- `GET /:id` — Get subscription details
- `POST /:id/renew` — Manually trigger recurring renewal *(Admin/Staff)*
- `POST /:id/pause` — Pause active subscription *(Admin/Staff)*
- `POST /:id/resume` — Resume paused subscription *(Admin/Staff)*
- `POST /:id/cancel` — Cancel subscription (immediate or end of period)
- `POST /:id/change-plan` — Upgrade or downgrade plan *(Admin/Staff)*

### Invoices (`/api/v1/invoices`)
- `POST /` — Create manual invoice *(Admin/Staff)*
- `GET /` — List and filter invoices *(Admin/Staff)*
- `GET /:id` — Get invoice details
- `PATCH /:id/status` — Update invoice status (`OPEN`, `PAID`, `VOID`)
- `GET /:id/pdf` — Download corporate invoice PDF

### Payments (`/api/v1/payments`)
- `POST /` — Record payment against invoice
- `GET /` — List recorded payments *(Admin/Staff)*
- `GET /:id` — Get payment details
- `POST /:id/refund` — Process full or partial refund *(Admin)*
- `GET /:id/receipt` — Download payment receipt PDF

### Customer Portal (`/api/v1/portal`)
- `GET /dashboard` — Customer self-service KPI dashboard
- `GET /subscriptions` — View customer's own subscriptions
- `GET /invoices` — View customer's invoices
- `GET /invoices/:id/pdf` — Download customer's invoice PDF
- `GET /payments` — View customer's payment history
- `GET /quotations` — View customer's quotations

### Analytics & Reports (`/api/v1/analytics`)
- `GET /summary` — Executive KPIs: MRR, ARR, churn rate, active subscribers *(Admin/Staff)*
- `GET /revenue` — Revenue trends over time *(Admin/Staff)*

### System & Audit (`/api/v1`)
- `GET /health` — Health check endpoint
- `GET /notifications` — Get user notifications
- `PATCH /notifications/:id/read` — Mark notification read
- `GET /audit-logs` — Query immutable system audit trail *(Admin)*

