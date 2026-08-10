
# Database Architecture & Schema Documentation

This document describes the relational database design for the **Mini ERP + CRM Operations Portal**.

---

## 🗄 Core Models & Schemas

### 1. User
Represents system users accessing the portal, scoped by Role-Based Access Control (RBAC).

- `id` (UUID, Primary Key)
- `name` (String)
- `email` (String, Unique Index)
- `passwordHash` (String)
- `role` (Enum: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`)
- `isActive` (Boolean, default: `true`)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

---

### 2. Customer
Stores customer contacts, business details, GST numbers, and sales pipeline status.

- `id` (UUID, Primary Key)
- `customerName` (String, Indexed)
- `mobileNumber` (String, Indexed)
- `email` (String, Optional)
- `businessName` (String, Optional)
- `gstNumber` (String, Optional)
- `customerType` (Enum: `RETAIL`, `WHOLESALE`, `DISTRIBUTOR`)
- `address` (String, Optional)
- `status` (Enum: `LEAD`, `ACTIVE`, `INACTIVE`, Indexed)
- `followUpDate` (Timestamp, Optional)
- `notes` (String, Optional)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

---

### 3. Product
Manages the inventory master catalog with pricing and safety threshold levels.

- `id` (UUID, Primary Key)
- `productName` (String)
- `sku` (String, Unique Index)
- `category` (String, Indexed)
- `unitPrice` (Decimal 12,2)
- `currentStock` (Integer, default: 0)
- `minimumStock` (Integer, default: 0)
- `warehouse` (String, Optional)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

---

### 4. StockMovement
Audit ledger for tracking every inventory inward/outward change.

- `id` (UUID, Primary Key)
- `productId` (UUID, FK -> Product)
- `quantity` (Integer)
- `type` (Enum: `IN`, `OUT`)
- `reason` (String, Optional)
- `createdBy` (UUID, FK -> User)
- `createdAt` (Timestamp, Indexed)

---

### 5. Challan
Represents a sales delivery challan issued to a customer.

- `id` (UUID, Primary Key)
- `challanNumber` (String, Unique Index)
- `customerId` (UUID, FK -> Customer)
- `totalQuantity` (Integer)
- `status` (Enum: `DRAFT`, `CONFIRMED`, `CANCELLED`, Indexed)
- `createdBy` (UUID, FK -> User)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

---

### 6. ChallanItem
Line items inside a sales delivery challan.

- `id` (UUID, Primary Key)
- `challanId` (UUID, FK -> Challan, OnDelete: Cascade)
- `productId` (UUID, FK -> Product)
- `productNameSnapshot` (String)
- `skuSnapshot` (String)
- `unitPriceSnapshot` (Decimal 12,2)
- `quantity` (Integer)
- `totalPrice` (Decimal 12,2)

---

### 7. FollowUp
Logs sales communication, notes, and scheduled follow-up dates for CRM management.

- `id` (UUID, Primary Key)
- `customerId` (UUID, FK -> Customer, OnDelete: Cascade)
- `note` (String)
- `followUpDate` (Timestamp, Indexed)
- `createdBy` (UUID, FK -> User)
- `createdAt` (Timestamp)

---

## 💡 Key Architectural Design Decisions

### 1. Why `ChallanItem` Stores Product Snapshots
In wholesale & distribution ERPs, product details change over time (unit price updates, product renaming, SKU reassignments). 
- If a delivery challan was generated in January for ₹1,200 per unit, and the product price increases to ₹1,500 in March, **historical challans must retain the original ₹1,200 price and product name**.
- Relying solely on a `productId` foreign key without snapshots would corrupt historical financial audit trails.
- Therefore, `productNameSnapshot`, `skuSnapshot`, and `unitPriceSnapshot` are immutably copied into `ChallanItem` upon creation.

### 2. Why `StockMovement` Exists
Maintaining only `currentStock` on the `Product` table is insufficient for ERP operations.
- `StockMovement` acts as an **immutable append-only audit trail** for all physical inventory additions (`IN`) and dispatches (`OUT`).
- Provides complete traceability regarding **who** changed inventory, **when**, **how much**, and **for what reason** (e.g., procurement inward, sales dispatch, damaged write-off).
- Prevents untraceable stock adjustments and enables stock reconciliation audits.
