# Mini ERP + CRM Operations Portal — REST API Specification

This document provides complete documentation for the Fundsroom Mini ERP + CRM Operations Portal REST API.

- **Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT Bearer Token (`Authorization: Bearer <token>`)
- **Format**: JSON (`Content-Type: application/json`)

---

## Standard Response Structure

### Success Response Format
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Detailed error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation rule error"
    }
  ]
}
```

---

## 1. Authentication API

### 1.1 Login User
- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Authentication**: None (Public)
- **Roles**: Public

#### Request Body
```json
{
  "email": "admin@fundsroom.com",
  "password": "Password@123"
}
```

#### Success Response (HTTP 200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "System Administrator",
      "email": "admin@fundsroom.com",
      "role": "ADMIN"
    }
  }
}
```

#### Error Response (HTTP 401)
```json
{
  "success": false,
  "message": "Invalid email or password credentials"
}
```

---

### 1.2 Get Current User Profile
- **Method**: `GET`
- **URL**: `/api/auth/me`
- **Authentication**: Required (`Bearer Token`)
- **Roles**: All (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`)

#### Success Response (HTTP 200)
```json
{
  "success": true,
  "message": "Current authenticated user retrieved successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "System Administrator",
      "email": "admin@fundsroom.com",
      "role": "ADMIN",
      "isActive": true
    }
  }
}
```

---

## 2. Customer CRM API

### 2.1 Get Customers List
- **Method**: `GET`
- **URL**: `/api/customers`
- **Authentication**: Required (`Bearer Token`)
- **Roles**: All (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`)
- **Query Parameters**:
  - `search` (string, optional): Search across name, mobile, email, business name
  - `status` (string, optional): `LEAD` | `ACTIVE` | `INACTIVE`
  - `customerType` (string, optional): `RETAIL` | `WHOLESALE` | `DISTRIBUTOR`
  - `page` (integer, default: 1)
  - `limit` (integer, default: 10)

#### Success Response (HTTP 200)
```json
{
  "success": true,
  "message": "Customers retrieved successfully",
  "data": {
    "customers": [
      {
        "id": "c1234567-e29b-41d4-a716-446655440000",
        "customerName": "Apex Traders",
        "mobileNumber": "9876543210",
        "email": "contact@apextraders.com",
        "businessName": "Apex Traders Pvt Ltd",
        "gstNumber": "27AAAAA0000A1Z5",
        "customerType": "WHOLESALE",
        "status": "ACTIVE",
        "followUpDate": "2026-08-20T10:00:00.000Z",
        "notes": "Bulk buyer",
        "createdAt": "2026-08-10T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalCount": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

---

### 2.2 Create Customer
- **Method**: `POST`
- **URL**: `/api/customers`
- **Authentication**: Required (`Bearer Token`)
- **Roles**: `ADMIN`, `SALES`

#### Request Body
```json
{
  "customerName": "Apex Traders",
  "mobileNumber": "9876543210",
  "email": "contact@apextraders.com",
  "businessName": "Apex Traders Pvt Ltd",
  "gstNumber": "27AAAAA0000A1Z5",
  "customerType": "WHOLESALE",
  "status": "ACTIVE",
  "address": "Building 12, Industrial Area, Mumbai",
  "followUpDate": "2026-08-20T10:00:00.000Z",
  "notes": "Primary wholesale distributor"
}
```

#### Success Response (HTTP 201)
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "customer": { ... }
  }
}
```

---

### 2.3 Get Customer By ID
- **Method**: `GET`
- **URL**: `/api/customers/:id`
- **Authentication**: Required (`Bearer Token`)
- **Roles**: All (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`)

---

### 2.4 Update Customer
- **Method**: `PUT`
- **URL**: `/api/customers/:id`
- **Authentication**: Required (`Bearer Token`)
- **Roles**: `ADMIN`, `SALES`

---

### 2.5 Delete Customer
- **Method**: `DELETE`
- **URL**: `/api/customers/:id`
- **Authentication**: Required (`Bearer Token`)
- **Roles**: `ADMIN`

#### Error Response (HTTP 403)
```json
{
  "success": false,
  "message": "Forbidden access. Required role: [ADMIN], current role: SALES"
}
```

---

### 2.6 Log Sales Follow-Up Activity
- **Method**: `POST`
- **URL**: `/api/customers/:id/follow-ups`
- **Authentication**: Required (`Bearer Token`)
- **Roles**: `ADMIN`, `SALES`

#### Request Body
```json
{
  "note": "Sent updated wholesale catalog and discount structure",
  "followUpDate": "2026-08-25T14:30:00.000Z"
}
```

---

### 2.7 Get Customer Follow-Up History
- **Method**: `GET`
- **URL**: `/api/customers/:id/follow-ups`
- **Authentication**: Required (`Bearer Token`)
- **Roles**: All (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`)

---

## 3. Product Catalog API

### 3.1 Get Products List
- **Method**: `GET`
- **URL**: `/api/products`
- **Authentication**: Required (`Bearer Token`)
- **Roles**: All (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`)
- **Query Parameters**:
  - `search` (string, optional)
  - `category` (string, optional)
  - `lowStock` (boolean, optional: `true` filters `currentStock <= minimumStock`)
  - `page` (integer, default: 1)
  - `limit` (integer, default: 10)

---

### 3.2 Create Product
- **Method**: `POST`
- **URL**: `/api/products`
- **Authentication**: Required (`Bearer Token`)
- **Roles**: `ADMIN`, `WAREHOUSE`

#### Request Body
```json
{
  "productName": "3-Phase Induction Motor 5HP",
  "sku": "MOT-3P-5HP-001",
  "category": "Motors & Drives",
  "unitPrice": 18500,
  "minimumStock": 5,
  "warehouse": "Main Bay A-1"
}
```

#### Error Response — Duplicate SKU (HTTP 409 / 400)
```json
{
  "success": false,
  "message": "Product with SKU 'MOT-3P-5HP-001' already exists"
}
```

---

### 3.3 Get Product By ID
- **Method**: `GET`
- **URL**: `/api/products/:id`

---

### 3.4 Update Product
- **Method**: `PUT`
- **URL**: `/api/products/:id`
- **Authentication**: Required (`Bearer Token`)
- **Roles**: `ADMIN`, `WAREHOUSE`

---

### 3.5 Delete Product
- **Method**: `DELETE`
- **URL**: `/api/products/:id`
- **Authentication**: Required (`Bearer Token`)
- **Roles**: `ADMIN`, `WAREHOUSE`

---

## 4. Inventory & Stock Movement API

### 4.1 Execute Stock IN
- **Method**: `POST`
- **URL**: `/api/inventory/:productId/stock-in`
- **Authentication**: Required (`Bearer Token`)
- **Roles**: `ADMIN`, `WAREHOUSE`

#### Request Body
```json
{
  "quantity": 50,
  "reason": "Purchase Order PO-8899 Arrival"
}
```

#### Success Response (HTTP 200)
```json
{
  "success": true,
  "message": "Stock IN successful for '3-Phase Induction Motor 5HP'. Added: 50, New Stock: 50",
  "data": {
    "product": { ... },
    "movement": {
      "id": "m1234567-e29b-41d4-a716-446655440000",
      "type": "IN",
      "quantity": 50,
      "reason": "Purchase Order PO-8899 Arrival",
      "createdBy": "u1234567-e29b-41d4-a716-446655440000"
    }
  }
}
```

---

### 4.2 Execute Stock OUT
- **Method**: `POST`
- **URL**: `/api/inventory/:productId/stock-out`
- **Authentication**: Required (`Bearer Token`)
- **Roles**: `ADMIN`, `WAREHOUSE`

#### Request Body
```json
{
  "quantity": 5,
  "reason": "Manual Showroom Issue"
}
```

#### Error Response — Insufficient Stock (HTTP 400)
```json
{
  "success": false,
  "message": "Insufficient stock for '3-Phase Induction Motor 5HP'. Available: 2, Requested: 5."
}
```

---

### 4.3 Get Stock Movement Audit Log
- **Method**: `GET`
- **URL**: `/api/inventory/movements`
- **Authentication**: Required (`Bearer Token`)
- **Roles**: All (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`)

---

### 4.4 Get Low Stock Products List
- **Method**: `GET`
- **URL**: `/api/inventory/low-stock`
- **Authentication**: Required (`Bearer Token`)
- **Roles**: All (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`)

---

## 5. Sales Delivery Challan API

### 5.1 Get Delivery Challans List
- **Method**: `GET`
- **URL**: `/api/challans`
- **Authentication**: Required (`Bearer Token`)
- **Roles**: All (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`)

---

### 5.2 Create Draft Sales Challan
- **Method**: `POST`
- **URL**: `/api/challans`
- **Authentication**: Required (`Bearer Token`)
- **Roles**: `ADMIN`, `SALES`, `WAREHOUSE`

#### Request Body
```json
{
  "customerId": "c1234567-e29b-41d4-a716-446655440000",
  "items": [
    {
      "productId": "p1234567-e29b-41d4-a716-446655440000",
      "quantity": 5
    }
  ]
}
```

#### Success Response (HTTP 201)
```json
{
  "success": true,
  "message": "Sales delivery challan 'CH-000001' created as DRAFT",
  "data": {
    "challan": {
      "id": "ch123456-e29b-41d4-a716-446655440000",
      "challanNumber": "CH-000001",
      "customerId": "c1234567-e29b-41d4-a716-446655440000",
      "status": "DRAFT",
      "totalQuantity": 5
    }
  }
}
```

---

### 5.3 Get Challan By ID
- **Method**: `GET`
- **URL**: `/api/challans/:id`

---

### 5.4 Confirm Sales Challan (Atomic Database Transaction)
- **Method**: `POST`
- **URL**: `/api/challans/:id/confirm`
- **Authentication**: Required (`Bearer Token`)
- **Roles**: `ADMIN`, `SALES`, `WAREHOUSE`

#### Success Response (HTTP 200)
```json
{
  "success": true,
  "message": "Sales challan 'CH-000001' confirmed and inventory stock updated",
  "data": {
    "challan": {
      "id": "ch123456-e29b-41d4-a716-446655440000",
      "status": "CONFIRMED"
    }
  }
}
```

#### Error Response — Insufficient Stock Transaction Rollback (HTTP 400)
```json
{
  "success": false,
  "message": "Insufficient stock for Integration Product Alpha. Available: 30, Requested: 40."
}
```

---

### 5.5 Cancel Sales Challan
- **Method**: `POST`
- **URL**: `/api/challans/:id/cancel`
- **Authentication**: Required (`Bearer Token`)
- **Roles**: `ADMIN`, `SALES`, `WAREHOUSE`

---

## 6. Executive Dashboard API

### 6.1 Get Dashboard Metrics
- **Method**: `GET`
- **URL**: `/api/dashboard/metrics`
- **Authentication**: Required (`Bearer Token`)
- **Roles**: All (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`)

#### Success Response (HTTP 200)
```json
{
  "success": true,
  "message": "Dashboard metrics retrieved successfully",
  "data": {
    "kpis": {
      "totalCustomers": 5,
      "totalProducts": 9,
      "lowStockCount": 1,
      "totalChallans": 6,
      "todaysChallans": 4
    },
    "recentChallans": [ ... ],
    "lowStockProducts": [ ... ],
    "recentStockMovements": [ ... ]
  }
}
```
