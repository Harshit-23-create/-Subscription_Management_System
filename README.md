# Brightloop Software — Enterprise Subscription Management System

A production-ready, full-stack **SaaS Subscription & Recurring Billing Management Platform** featuring a **React 18 + TypeScript + Tailwind CSS** frontend and an **Express.js + TypeScript + MongoDB + Zod + PDFKit** backend.

---

## Architecture Overview

```
                            ┌───────────────────────────────────┐
                            │    React 18 SPA (Port 3000)       │
                            │   Tailwind CSS / TanStack Query   │
                            └─────────────────┬─────────────────┘
                                              │ HTTP / Axios (Bearer JWT)
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               EXPRESS BACKEND (Port 5000)                               │
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

## 🚀 Key Features

### 1. Modern Enterprise Dashboard (Stripe & Linear Inspired)
- **13 Complete Modules:** Overview, Customers, Products, Plans, Quotations, Subscriptions, Invoices, Payments, Discounts, Taxes, Analytics, Settings, and Customer Portal.
- **Three User Roles:** Admin (Complete Governance), Staff (Operations & Support), Customer (Self-Service Portal).
- **1-Click Demo Login:** Fast credential auto-fill for instant evaluation across roles.

### 2. Robust Backend API Architecture
- **JWT Authentication & RBAC:** Salted & hashed passwords (`bcryptjs`), access & refresh tokens, customer resource isolation.
- **PDF Generation Engine:** Automated vector PDF generation using `PDFKit` for Corporate Invoices, Quotations, and Payment Receipts.
- **Automated Recurring Billing Scheduler:** Background runner for automatic renewal invoices, trial conversions, and period-end cancellations.
- **Dual Database Mode:** Connects to local MongoDB (`mongodb://localhost:27017`) with built-in zero-config fallback to `mongodb-memory-server`.
- **Interactive Documentation:** Swagger UI at `http://localhost:5000/api/docs` and OpenAPI 3.1 specification at `/api/openapi.json`.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite 6, Tailwind CSS, TanStack Query v5, React Hook Form, Zod, Recharts, Axios, Lucide React, Radix UI |
| **Backend** | Node.js, Express.js 5, TypeScript, Mongoose, Zod, JWT, bcryptjs, Helmet, CORS, Morgan, PDFKit |
| **Database** | MongoDB Atlas / Local MongoDB (port 27017) / In-Memory Fallback |
| **Testing** | Vitest, Supertest, PowerShell automated E2E pipeline (65/65 tests passing) |

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js** v20+ or v26 LTS
- **npm** v10+
- **MongoDB** (Local instance on port 27017 or MongoDB Atlas connection string)

### 2. Running the Backend API Server
```powershell
# Open Terminal 1
cd "backend code"
npm install
npm run seed     # Seeds demo users, products, plans, active subscriptions, and invoices
npm run dev      # Starts REST API on http://localhost:5000/api/v1
```
- API Base URL: `http://localhost:5000/api/v1`
- Swagger UI Docs: `http://localhost:5000/api/docs`

### 3. Running the React Frontend
```powershell
# Open Terminal 2 (in project root)
npm install
npm run dev -- --host 0.0.0.0 --port 3000
```
Open **`http://localhost:3000`** in your browser.

---

## 👥 Demo Accounts for Testing

On the **Login Screen** (`/login`), click any of the 1-click auto-fill buttons:

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Admin** | `admin@subflow.io` | `AdminPassword123!` | Complete administrative dashboard, executive analytics, and settings |
| **Staff** | `staff@subflow.io` | `StaffPassword123!` | Customer directory, quotations, subscriptions, and payment processing |
| **Customer** | `acme.billing@acmecorp.com` | `CustomerPassword123!` | Dedicated Customer Portal (`/portal/overview`, my contracts, invoice PDFs) |

---

## 🧪 Testing

### Run Backend Unit & Integration Tests (31 Tests)
```powershell
cd "backend code"
npm test
```

### Build & Type Check Frontend (0 Errors)
```powershell
npm run build
```

---

## 📂 Repository Structure

```
├── backend code/             # Express.js REST API Backend
│   ├── src/
│   │   ├── config/           # Database & environment variables
│   │   ├── controllers/      # Resource controllers (Auth, Customers, Invoices, etc.)
│   │   ├── docs/             # OpenAPI 3.1 JSON specification
│   │   ├── jobs/             # Recurring billing background scheduler
│   │   ├── middleware/       # JWT authentication & RBAC guards
│   │   ├── models/           # Mongoose database models
│   │   ├── routes/           # Express router endpoints
│   │   ├── schemas/          # Zod validation schemas
│   │   ├── scripts/          # Database seeder
│   │   ├── services/         # Business logic & PDF generation
│   │   └── utils/            # Calculation engine & logger
│   └── tests/                # Automated Vitest test suite
│
├── src/                      # React Enterprise Frontend
│   ├── api/                  # Axios service layer connecting to backend
│   ├── components/           # Reusable UI primitives and domain widgets
│   ├── context/              # Authentication & Toast providers
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # All 13 page interfaces + Customer Portal
│   ├── routes/               # Role-protected routing configuration
│   └── types/                # Strongly-typed TypeScript interfaces
│
├── API_INTEGRATION_REPORT.md # Complete full-stack integration audit
├── package.json
└── tailwind.config.js
```

---

## 📄 License
MIT License. Built for Brightloop Software Subscription Management.
