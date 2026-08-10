# System Architecture Documentation

This document outlines the high-level system architecture and component structure for the **Mini ERP + CRM Operations Portal**.

---

## 🏛 System Architecture Overview

The system follows a **Modular Monolith** pattern using TypeScript across both backend and frontend layers:

```
[ Frontend: React 19 + TypeScript + Vite + Tailwind CSS ]
                         │
                         │ HTTP / REST API (Axios)
                         ▼
[ Backend: Node.js + Express + TypeScript ]
     ├── Middleware: Auth (JWT), Validation (Zod), RBAC
     ├── Modules: Auth, Customers, Products, Inventory, Challans
     └── Persistence Layer: Prisma ORM
                         │
                         ▼
[ Database: PostgreSQL ]
```

---

## 🔒 Security & Data Integrity Principles

1. **Role-Based Access Control (RBAC)**:
   - `ADMIN`: Full administrative access to users, system config, inventory, and financial challans.
   - `SALES`: Customer creation, CRM follow-ups, draft challan creation.
   - `WAREHOUSE`: Product management, stock movements (`IN`/`OUT`), inventory adjustments.
   - `ACCOUNTS`: Challan status review, invoice reporting, accounts view.

2. **Snapshot Immutability**:
   - Challan line items store frozen snapshots of unit price, SKU, and product name at the time of creation to guarantee compliance and historical accuracy.

3. **Append-Only Inventory Ledger**:
   - Direct manual edits to `currentStock` without audit records are prohibited; all stock updates are driven through `StockMovement` transactions.

4. **Transactional Consistency**:
   - Stock movement and sales challan confirmations execute inside database transactions (`prisma.$transaction`) to prevent partial failures and race conditions.
