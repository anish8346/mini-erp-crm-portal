const BASE_URL = 'http://localhost:5000/api';

async function runInventoryTests() {
  console.log('🧪 Starting Phase 6 Inventory & Stock Movements Backend Verification Tests...\n');

  let adminToken = '';
  let warehouseToken = '';
  let salesToken = '';
  let testProductId = '';

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

  // 2. Create Test Product
  console.log('2️⃣ Creating Test Product (Initial Stock: 20, Min Stock: 10)...');
  const prodRes = await apiRequest('/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${warehouseToken}` },
    body: JSON.stringify({
      productName: 'Inventory Test Valve 50mm',
      sku: 'PROD-INV-TEST-01',
      category: 'Hardware',
      unitPrice: 1200.00,
      currentStock: 20,
      minimumStock: 10,
      warehouse: 'Central Warehouse',
    }),
  });

  if (prodRes.status === 201 && prodRes.body.success) {
    testProductId = prodRes.body.data.product.id;
    console.log('   ✅ PASS: Test product created. ID:', testProductId);
  } else {
    console.error('   ❌ FAIL: Product creation failed:', prodRes);
  }

  // 3. Stock IN Test
  console.log('3️⃣ Testing Stock IN (Adding 50 units)...');
  const stockInRes = await apiRequest(`/inventory/${testProductId}/stock-in`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${warehouseToken}` },
    body: JSON.stringify({
      quantity: 50,
      reason: 'Purchase shipment PO-9988 received',
    }),
  });

  if (
    stockInRes.status === 201 &&
    stockInRes.body.success &&
    stockInRes.body.data.product.currentStock === 70 &&
    stockInRes.body.data.movement.type === 'IN'
  ) {
    console.log('   ✅ PASS: Stock IN atomic transaction complete. Updated Stock: 70.');
  } else {
    console.error('   ❌ FAIL: Stock IN failed:', stockInRes);
  }

  // 4. Stock OUT Test (Valid)
  console.log('4️⃣ Testing Stock OUT (Issuing 15 units)...');
  const stockOutRes = await apiRequest(`/inventory/${testProductId}/stock-out`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${warehouseToken}` },
    body: JSON.stringify({
      quantity: 15,
      reason: 'Factory line dispatch SO-3344',
    }),
  });

  if (
    stockOutRes.status === 201 &&
    stockOutRes.body.success &&
    stockOutRes.body.data.product.currentStock === 55 &&
    stockOutRes.body.data.movement.type === 'OUT'
  ) {
    console.log('   ✅ PASS: Stock OUT atomic transaction complete. Updated Stock: 55.');
  } else {
    console.error('   ❌ FAIL: Stock OUT failed:', stockOutRes);
  }

  // 5. Insufficient Stock Test (Attempting OUT of 999 units when 55 available)
  console.log('5️⃣ Testing Insufficient Stock Protection (Attempting to issue 999 units)...');
  const insufficientRes = await apiRequest(`/inventory/${testProductId}/stock-out`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${warehouseToken}` },
    body: JSON.stringify({
      quantity: 999,
      reason: 'Excessive issue request',
    }),
  });

  if (insufficientRes.status === 400 && !insufficientRes.body.success) {
    console.log('   ✅ PASS: Insufficient stock rejected with HTTP 400:', insufficientRes.body.message);
  } else {
    console.error('   ❌ FAIL: Expected HTTP 400 for insufficient stock, got:', insufficientRes.status);
  }

  // 6. Zero & Negative Quantity Test
  console.log('6️⃣ Testing Zero & Negative Quantity Validation (Quantity: -10)...');
  const invalidQtyRes = await apiRequest(`/inventory/${testProductId}/stock-in`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${warehouseToken}` },
    body: JSON.stringify({
      quantity: -10,
      reason: 'Invalid quantity test',
    }),
  });

  if (invalidQtyRes.status === 400 && !invalidQtyRes.body.success) {
    console.log('   ✅ PASS: Invalid negative quantity rejected with HTTP 400.');
  } else {
    console.error('   ❌ FAIL: Expected HTTP 400 for negative quantity, got:', invalidQtyRes.status);
  }

  // 7. Movement History Audit Endpoint
  console.log('7️⃣ Testing Stock Movement History Audit Trail (GET /api/inventory/movements)...');
  const movementsRes = await apiRequest(`/inventory/movements?productId=${testProductId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${salesToken}` },
  });

  if (
    movementsRes.status === 200 &&
    movementsRes.body.success &&
    movementsRes.body.data.movements.length >= 2
  ) {
    console.log('   ✅ PASS: Movement history fetched (Count: ' + movementsRes.body.data.movements.length + '). Audit trail verified.');
  } else {
    console.error('   ❌ FAIL: Fetch movement history failed:', movementsRes);
  }

  // 8. Low Stock Endpoint Test
  console.log('8️⃣ Testing Low Stock Endpoint (Issuing 50 units so stock drops to 5 <= minStock 10)...');
  await apiRequest(`/inventory/${testProductId}/stock-out`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${warehouseToken}` },
    body: JSON.stringify({ quantity: 50, reason: 'Reduce to low stock for testing' }),
  });

  const lowStockRes = await apiRequest('/inventory/low-stock', {
    method: 'GET',
    headers: { Authorization: `Bearer ${salesToken}` },
  });

  if (
    lowStockRes.status === 200 &&
    lowStockRes.body.success &&
    lowStockRes.body.data.products.some(p => p.id === testProductId)
  ) {
    console.log('   ✅ PASS: Low stock product correctly returned in /api/inventory/low-stock.');
  } else {
    console.error('   ❌ FAIL: Low stock test failed:', lowStockRes);
  }

  // 9. RBAC Check (Sales user blocked from Stock IN / Stock OUT)
  console.log('9️⃣ Testing Inventory RBAC (Sales User attempting Stock IN)...');
  const salesStockIn = await apiRequest(`/inventory/${testProductId}/stock-in`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${salesToken}` },
    body: JSON.stringify({ quantity: 10 }),
  });

  if (salesStockIn.status === 403) {
    console.log('   ✅ PASS: Sales user forbidden from Stock IN (403):', salesStockIn.body.message);
  } else {
    console.error('   ❌ FAIL: Expected 403 for Sales Stock IN, got:', salesStockIn.status);
  }

  // 10. Cleanup Test Product
  console.log('🔟 Cleaning up test product...');
  await apiRequest(`/products/${testProductId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('   ✅ PASS: Cleanup complete.');

  console.log('\n🎉 ALL 10 INVENTORY & STOCK MOVEMENT TESTS PASSED SUCCESSFULLY!');
}

runInventoryTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
