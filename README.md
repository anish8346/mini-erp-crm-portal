# Mini ERP + CRM Operations Portal

A complete, full-stack B2B wholesale distribution management platform built for **Fundsroom Infotech Pvt. Ltd.** The portal combines Customer CRM pipeline tracking, Product Master Catalog management, Inventory Ledger audit history, and Sales Delivery Challan fulfillment with atomic database transaction guarantees.

---

## Overview

The **Mini ERP + CRM Operations Portal** streamlines end-to-end wholesale operations. It empowers sales, warehouse, and accounts teams to track leads, manage catalog items, record inward/outward inventory movements, and fulfill delivery challans with 100% transactional stock protection.

---

## Problem Statement

Wholesale and distribution companies often suffer from fragmented systems where sales teams log customer leads separately from warehouse stock counts. This disconnect leads to over-committing out-of-stock items, manual errors in delivery challan generation, and untracked inventory leaks.

**Solution**: A unified, real-time portal enforcing strict backend role authorization and multi-product atomic database transactions (`prisma.$transaction`). Stock is only deducted when a delivery challan is confirmed, and any stock insufficiency rolls back the entire operation atomically.

---

## Features

- **Executive Operations Dashboard**: Real-time KPI summary cards (Total Customers, Total Products, Low Stock Alerts, Total Challans, Today's Challans), recent delivery challan feed, low stock threshold alerts, and inventory audit logs.
- **Customer CRM**: Searchable customer accounts ledger, pipeline status tracking (`LEAD`, `ACTIVE`, `INACTIVE`), customer types (`RETAIL`, `WHOLESALE`, `DISTRIBUTOR`), GSTIN verification, and chronological sales follow-up history logging.
- **Product Catalog**: Product master catalog with unique SKU enforcement, safety stock minimum threshold alerts, warehouse bay locations, and price controls.
- **Inventory & Stock Ledger**: Real-time stock balance tracking, Stock IN (purchase arrivals) and Stock OUT (dispatches) operations, low stock alerts, and audit trail.
- **Sales Delivery Challans**:
  - Sequential challan numbering (`CH-000001`, `CH-000002`...).
  - Multi-item draft builder storing immutable product snapshots (`productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot`).
  - Stock protection in `DRAFT` state.
  - Atomic confirmation (`POST /api/challans/:id/confirm`) with stock validation, deduction, and `OUT` movement generation.
  - Safe cancellation with automatic inventory restock reversal.
- **Role-Based Access Control (RBAC)**: Enforced across 4 system roles (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, React Router DOM, Axios, Lucide Icons.
- **Backend**: Node.js, TypeScript, Express.js, Prisma ORM, Zod, JWT, bcryptjs.
- **Database**: PostgreSQL (`minierp_db`).
- **Tooling**: Vite, Postman, ts-node-dev.

---

## Architecture

```
[ React 19 Frontend App ]
         │
         ▼ (Axios HTTP + JWT Bearer Header)
[ Express.js REST API Layer ]
         │
         ├── Middleware (Authentication & RBAC Enforcement)
         ├── Validators (Zod Schemas)
         ├── Controllers (HTTP Request/Response Handler)
         └── Services (Business Logic & Prisma Client)
                  │
                  ▼ (Prisma ORM & PostgreSQL Database)
[ PostgreSQL DB (7 Models + Atomic $transaction) ]
```

---

## Folder Structure

```
mini-erp-crm-portal/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database Schema Definitions
│   │   └── seed.ts             # Initial Seed Script
│   ├── src/
│   │   ├── config/             # Environment & Prisma Singleton
│   │   ├── controllers/        # Express Route Controllers
│   │   ├── middleware/         # Auth, Role Guard & Error Handlers
│   │   ├── routes/             # REST Route Definitions
│   │   ├── services/           # Business Logic & Transactions
│   │   ├── types/              # TypeScript Declarations
│   │   ├── utils/              # JWT, Hashing & API Response Formatters
│   │   ├── validators/         # Zod Schema Validators
│   │   ├── app.ts              # Express App Configuration
│   │   └── server.ts           # HTTP Server Bootstrap
│   ├── test-phase15-qa.js     # Automated E2E & Transaction Test Suite
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Layout & Reusable UI Components
│   │   ├── context/            # AuthContext & ToastContext
│   │   ├── pages/              # Dashboard, CRM, Catalog, Inventory, Challan Views
│   │   ├── services/           # Centralized Axios API Layer
│   │   ├── types/              # Frontend TypeScript Models
│   │   └── App.tsx             # Application Router Setup
│   └── package.json
├── docs/
│   ├── api.md                  # Complete REST API Specifications
│   ├── database.md             # Entity Relationship & Schema Docs
│   ├── architecture.md         # Layered System Architecture Guide
│   └── screenshots/            # Application UI Screenshots
└── postman/
    └── mini-erp.postman_collection.json  # Complete Postman Collection
```

---

## Database Schema & Models

The database consists of 7 PostgreSQL tables managed via Prisma ORM:
- **`User`**: System accounts, password hashes, and RBAC roles (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).
- **`Customer`**: Wholesale buyers, business details, GSTIN, status, and scheduled follow-up dates.
- **`FollowUp`**: Chronological sales activity history logs linked to customers and creators.
- **`Product`**: Master catalog items, unique SKUs, pricing, current stock, and safety stock thresholds.
- **`StockMovement`**: Inward (`IN`) and outward (`OUT`) audit movement log.
- **`Challan`**: Delivery challan header, sequential number, status (`DRAFT`, `CONFIRMED`, `CANCELLED`), and customer relation.
- **`ChallanItem`**: Itemized lines preserving immutable snapshot prices and SKUs.

---

## Authentication & Role-Based Access Control (RBAC)

Authentication uses JWT tokens signed with `JWT_SECRET`. Passwords are hashed using `bcryptjs` with 10 salt rounds.

### Permission Matrix

| Endpoint / Feature | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
| :--- | :---: | :---: | :---: | :---: |
| **Login & Profile (`/auth`)** | ✅ | ✅ | ✅ | ✅ |
| **Dashboard Metrics (`/dashboard`)** | ✅ | ✅ | ✅ | ✅ |
| **Customer List & Details** | ✅ | ✅ | ✅ | ✅ |
| **Create & Edit Customer** | ✅ | ✅ | ❌ | ❌ |
| **Delete Customer** | ✅ | ❌ | ❌ | ❌ |
| **Product List & Details** | ✅ | ✅ | ✅ | ✅ |
| **Create/Edit/Delete Product** | ✅ | ❌ | ✅ | ❌ |
| **Stock IN / Stock OUT** | ✅ | ❌ | ✅ | ❌ |
| **Create Draft Challan** | ✅ | ✅ | ✅ | ❌ |
| **Confirm & Cancel Challan** | ✅ | ✅ | ✅ | ❌ |
| **User Management (`/users`)** | ✅ | ❌ | ❌ | ❌ |

---

## Business Logic & Transaction Guarantees

1. **Draft Stock Protection**: When a sales challan is created as `DRAFT`, inventory stock balances are **never modified**.
2. **Atomic Multi-Product Confirmation**: When confirming a `DRAFT` challan via `POST /api/challans/:id/confirm`:
   - Executes inside a single PostgreSQL transaction (`prisma.$transaction`).
   - Pre-validates live available stock for **every single item**.
   - If **any product** has `currentStock < requestedQuantity`, an error is thrown, rolling back all updates.
   - **Zero stock is deducted**, **no stock movements are created**, and the status remains `DRAFT`.
3. **Immutable Product Snapshots**: When items are added to a challan, `productNameSnapshot`, `skuSnapshot`, and `unitPriceSnapshot` are preserved in `ChallanItem` so future catalog price updates do not alter past delivery records.

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/minierp_db?schema=public
JWT_SECRET=super_secret_jwt_key_fundsroom_2026
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+) running locally on port 5432

### 1. Clone Repository & Install Dependencies
```bash
# Clone repository
git clone https://github.com/anish8346/mini-erp-crm-portal.git
cd mini-erp-crm-portal

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 2. Database Migration & Seed Data
```bash
cd ../backend

# Create PostgreSQL database and run migrations
npx prisma migrate dev --name init

# Seed database with users, customers, products & initial stock
npx prisma db seed
```

### 3. Start Backend Dev Server
```bash
cd backend
npm run dev
# Server will run at http://localhost:5000
```

### 4. Start Frontend Dev Server
```bash
cd frontend
npm run dev
# App will run at http://localhost:3000
```

---

## Test Credentials

All seeded accounts use password: **`Password@123`**

| Role | Email | Password | Allowed Access |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@fundsroom.com` | `Password@123` | Full System Access |
| **SALES** | `sales@fundsroom.com` | `Password@123` | CRM, Catalog (View), Challans |
| **WAREHOUSE** | `warehouse@fundsroom.com` | `Password@123` | Inventory, Catalog (CRUD), Challans |
| **ACCOUNTS** | `accounts@fundsroom.com` | `Password@123` | Read-Only Audit & Reporting |

---

## Deployment & Database Connection Troubleshooting

### Cloud Deployment (Render / Railway / Supabase)

#### 1. Supabase PostgreSQL Connection String Configuration
When connecting Prisma to a hosted PostgreSQL instance on Supabase or Neon:
- **Direct Connection / Session Mode (Recommended)**: Use Port `5432`
  ```env
  DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@db.[REF].supabase.co:5432/postgres?connect_timeout=30"
  ```
- **Transaction Pooler Mode**: Use Port `6543` and append `?pgbouncer=true`
  ```env
  DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@db.[REF].supabase.co:6543/postgres?pgbouncer=true&connect_timeout=30"
  ```

#### 2. Automatic Connection Retry Mechanism
The backend (`src/config/prisma.ts`) contains built-in exponential backoff connection retries (5 attempts, 3s delay) during startup. If a cloud database is spinning up or experiencing connection pooler delays, the server automatically retries instead of crashing the deployment build.

#### 3. Render Deployment Commands
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npm start`

---

## Postman Collection

Import `postman/mini-erp.postman_collection.json` into Postman. It contains pre-configured requests with automated token saving:
- `1. Authentication` (Admin, Sales, Warehouse, Accounts Login)
- `2. Customers` (CRUD & Follow-ups)
- `3. Products` (CRUD & Duplicate SKU Rejection)
- `4. Inventory` (Stock IN, Stock OUT, Audit Trail, Low Stock)
- `5. Challans` (Draft, Confirm, Cancel, Insufficient Stock Rejection)
- `6. Dashboard` (Metrics API)

---

## UI Screenshots

| View | Screenshot |
| :--- | :--- |
| **Login Screen** | ![Login Screen](docs/screenshots/login.jpg) |
| **Executive Dashboard** | ![Executive Dashboard](docs/screenshots/dashboard.jpg) |

---

## Assumptions

1. Single currency operation in Indian Rupees (`₹`).
2. Inventory movements are tracked at product level without individual serial number barcode scans.
3. Cancelling a `CONFIRMED` challan automatically executes an inventory restock reversal (`+quantity`) inside a transaction.

---

## Known Limitations

1. **Batch/Lot Expiry Tracking**: Expiry date tracking per batch is not included in the basic schema.
2. **PDF Export**: Challans are rendered in HTML/browser view; native PDF generation can be added as a future enhancement.

---

## Future Improvements

1. Automated PDF download for delivery challans.
2. Multi-warehouse stock transfers between locations.
3. Multi-currency support for international wholesale dispatches.
