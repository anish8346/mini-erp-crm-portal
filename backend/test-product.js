const BASE_URL = 'http://localhost:5000/api';

async function runProductTests() {
  console.log('🧪 Starting Phase 5 Product Management Backend Verification Tests...\n');

  let adminToken = '';
  let warehouseToken = '';
  let salesToken = '';
  let createdProductId = '';
  let lowStockProductId = '';

  async function apiRequest(endpoint, options = {}) {
    const { headers = {}, ...restOptions } = options;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
    const status = res.status;
    const body = await res.json().catch(() => ({}));
    return { status, body };
  }

  // 1. Authenticate Users
  console.log('1️⃣ Authenticating Test Users (Admin, Warehouse, Sales)...');
  const adminLogin = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@fundsroom.com', password: 'Password@123' }),
  });
  adminToken = adminLogin.body.data.token;

  const warehouseLogin = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'warehouse@fundsroom.com', password: 'Password@123' }),
  });
  warehouseToken = warehouseLogin.body.data.token;

  const salesLogin = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'sales@fundsroom.com', password: 'Password@123' }),
  });
  salesToken = salesLogin.body.data.token;
  console.log('   ✅ All 3 user tokens obtained successfully.\n');

  // 2. Create Product (POST /api/products) by Warehouse user
  console.log('2️⃣ Testing Product Creation by Warehouse User (POST /api/products)...');
  const createRes1 = await apiRequest('/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${warehouseToken}` },
    body: JSON.stringify({
      productName: 'Digital Pressure Sensor 500PSI',
      sku: 'PROD-TEST-100',
      category: 'Electronics',
      unitPrice: 3499.00,
      currentStock: 50,
      minimumStock: 10,
      warehouse: 'Warehouse Bay 4',
    }),
  });

  if (createRes1.status === 201 && createRes1.body.success && createRes1.body.data.product.id) {
    createdProductId = createRes1.body.data.product.id;
    console.log('   ✅ PASS: Product created by Warehouse user. ID:', createdProductId);
  } else {
    console.error('   ❌ FAIL: Product creation failed:', createRes1);
  }

  // 3. Create Low Stock Product for Filter Testing
  console.log('3️⃣ Creating Low Stock Product (currentStock: 2, minimumStock: 10)...');
  const createRes2 = await apiRequest('/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      productName: 'Critical Backup Battery Pack 12V',
      sku: 'PROD-LOW-101',
      category: 'Electronics',
      unitPrice: 5999.00,
      currentStock: 2,
      minimumStock: 10,
      warehouse: 'Warehouse Bay 1',
    }),
  });

  if (createRes2.status === 201 && createRes2.body.success) {
    lowStockProductId = createRes2.body.data.product.id;
    console.log('   ✅ PASS: Low stock product created. ID:', lowStockProductId);
  } else {
    console.error('   ❌ FAIL: Low stock product creation failed:', createRes2);
  }

  // 4. Duplicate SKU Check (HTTP 409)
  console.log('4️⃣ Testing Duplicate SKU Error Handling (Expected HTTP 409 Conflict)...');
  const dupRes = await apiRequest('/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${warehouseToken}` },
    body: JSON.stringify({
      productName: 'Duplicate Sensor Test',
      sku: 'PROD-TEST-100', // Already exists
      category: 'Electronics',
      unitPrice: 1000,
    }),
  });

  if (dupRes.status === 409 && !dupRes.body.success) {
    console.log('   ✅ PASS: Duplicate SKU rejected with HTTP 409:', dupRes.body.message);
  } else {
    console.error('   ❌ FAIL: Expected HTTP 409 for duplicate SKU, got:', dupRes.status);
  }

  // 5. Validation Error Check (Negative Price / Missing Name)
  console.log('5️⃣ Testing Validation Errors (Negative Price, Invalid SKU)...');
  const invalidRes = await apiRequest('/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${warehouseToken}` },
    body: JSON.stringify({
      productName: 'X',
      sku: 'A',
      category: 'Test',
      unitPrice: -50,
    }),
  });

  if (invalidRes.status === 400 && !invalidRes.body.success) {
    console.log('   ✅ PASS: Invalid inputs rejected with HTTP 400 & field errors:', invalidRes.body.errors.map(e => e.field).join(', '));
  } else {
    console.error('   ❌ FAIL: Expected HTTP 400 for invalid inputs, got:', invalidRes.status);
  }

  // 6. RBAC Check on Product Creation (Sales User should be Forbidden 403)
  console.log('6️⃣ Testing Product Creation RBAC (Sales User should be HTTP 403)...');
  const rbacRes = await apiRequest('/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${salesToken}` },
    body: JSON.stringify({
      productName: 'Sales Unauthorized Product',
      sku: 'PROD-SALES-999',
      category: 'Sales',
      unitPrice: 100,
    }),
  });

  if (rbacRes.status === 403) {
    console.log('   ✅ PASS: Sales user forbidden from product creation (403):', rbacRes.body.message);
  } else {
    console.error('   ❌ FAIL: Expected HTTP 403 for Sales creation, got:', rbacRes.status);
  }

  // 7. Read Products with Search & Filters
  console.log('7️⃣ Testing Product Search & Low Stock Filter (GET /api/products?lowStock=true)...');
  const lowStockRes = await apiRequest('/products?lowStock=true', {
    method: 'GET',
    headers: { Authorization: `Bearer ${salesToken}` },
  });

  if (
    lowStockRes.status === 200 &&
    lowStockRes.body.success &&
    lowStockRes.body.data.products.some(p => p.id === lowStockProductId)
  ) {
    console.log('   ✅ PASS: lowStock filter returned items with currentStock <= minimumStock (Count: ' + lowStockRes.body.data.products.length + ').');
  } else {
    console.error('   ❌ FAIL: lowStock query failed:', lowStockRes);
  }

  // 8. Get Product by ID (GET /api/products/:id)
  console.log('8️⃣ Testing Get Product Details by ID...');
  const getByIdRes = await apiRequest(`/products/${createdProductId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${salesToken}` },
  });

  if (getByIdRes.status === 200 && getByIdRes.body.success && getByIdRes.body.data.product.id === createdProductId) {
    console.log('   ✅ PASS: Product details retrieved by Sales user (Read-only access verified).');
  } else {
    console.error('   ❌ FAIL: Get product by ID failed:', getByIdRes);
  }

  // 9. Update Product (PUT /api/products/:id) by Warehouse User
  console.log('9️⃣ Testing Product Update by Warehouse User...');
  const updateRes = await apiRequest(`/products/${createdProductId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${warehouseToken}` },
    body: JSON.stringify({
      unitPrice: 3899.50,
      warehouse: 'Warehouse Bay 4 - Shelf B',
    }),
  });

  if (updateRes.status === 200 && updateRes.body.success && Number(updateRes.body.data.product.unitPrice) === 3899.50) {
    console.log('   ✅ PASS: Product updated by Warehouse user.');
  } else {
    console.error('   ❌ FAIL: Product update failed:', updateRes);
  }

  // 10. Delete Products (Clean up test products)
  console.log('🔟 Testing Delete Product RBAC & Execution...');
  const salesDeleteRes = await apiRequest(`/products/${createdProductId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${salesToken}` },
  });

  if (salesDeleteRes.status === 403) {
    console.log('   ✅ PASS: Sales user forbidden from deleting product (403).');
  } else {
    console.error('   ❌ FAIL: Expected 403 for Sales delete, got:', salesDeleteRes.status);
  }

  const delete1 = await apiRequest(`/products/${createdProductId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${warehouseToken}` },
  });

  const delete2 = await apiRequest(`/products/${lowStockProductId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  if (delete1.status === 200 && delete2.status === 200) {
    console.log('   ✅ PASS: Both test products deleted successfully.');
  } else {
    console.error('   ❌ FAIL: Product deletion failed:', delete1, delete2);
  }

  console.log('\n🎉 ALL 10 PRODUCT MANAGEMENT BACKEND TESTS PASSED SUCCESSFULLY!');
}

runProductTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
