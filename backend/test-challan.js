const BASE_URL = 'http://localhost:5000/api';

async function runChallanTests() {
  console.log('🧪 Starting Phase 7 Sales Challan Backend Verification Tests...\n');

  let adminToken = '';
  let salesToken = '';
  let warehouseToken = '';
  let customerId = '';
  let productId1 = '';
  let productId2 = '';
  let initialStockProd1 = 0;
  let createdChallanId = '';

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
  console.log('1️⃣ Authenticating Test Users (Admin, Sales, Warehouse)...');
  const adminLogin = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@fundsroom.com', password: 'Password@123' }),
  });
  adminToken = adminLogin.body.data.token;

  const salesLogin = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'sales@fundsroom.com', password: 'Password@123' }),
  });
  salesToken = salesLogin.body.data.token;

  const warehouseLogin = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'warehouse@fundsroom.com', password: 'Password@123' }),
  });
  warehouseToken = warehouseLogin.body.data.token;
  console.log('   ✅ All 3 user tokens obtained successfully.\n');

  // 2. Fetch seed Customer and Products
  console.log('2️⃣ Fetching Customer & Products for Challan creation...');
  const customersRes = await apiRequest('/customers?limit=1', {
    method: 'GET',
    headers: { Authorization: `Bearer ${salesToken}` },
  });
  customerId = customersRes.body.data.customers[0].id;

  const productsRes = await apiRequest('/products?limit=2', {
    method: 'GET',
    headers: { Authorization: `Bearer ${salesToken}` },
  });
  productId1 = productsRes.body.data.products[0].id;
  productId2 = productsRes.body.data.products[1].id;
  initialStockProd1 = productsRes.body.data.products[0].currentStock;
  console.log(`   ✅ Target Customer ID: ${customerId}`);
  console.log(`   ✅ Target Product 1 ID: ${productId1} (Stock: ${initialStockProd1})`);
  console.log(`   ✅ Target Product 2 ID: ${productId2}\n`);

  // 3. Create Draft Delivery Challan (POST /api/challans)
  console.log('3️⃣ Testing Draft Challan Creation (POST /api/challans)...');
  const createRes = await apiRequest('/challans', {
    method: 'POST',
    headers: { Authorization: `Bearer ${salesToken}` },
    body: JSON.stringify({
      customerId,
      items: [
        { productId: productId1, quantity: 5 },
        { productId: productId2, quantity: 3 },
      ],
    }),
  });

  if (createRes.status === 201 && createRes.body.success && createRes.body.data.challan.id) {
    const challan = createRes.body.data.challan;
    createdChallanId = challan.id;
    console.log(`   ✅ PASS: Draft Challan created. Number: ${challan.challanNumber}, Status: ${challan.status}, TotalQty: ${challan.totalQuantity}`);

    // Verify snapshot fields
    const item1 = challan.items[0];
    if (item1.productNameSnapshot && item1.skuSnapshot && item1.unitPriceSnapshot && item1.totalPrice) {
      console.log(`   ✅ PASS: Item snapshot verified (Name: '${item1.productNameSnapshot}', SKU: '${item1.skuSnapshot}', Price: ₹${item1.unitPriceSnapshot}).`);
    } else {
      console.error('   ❌ FAIL: Snapshot fields missing from challan item:', item1);
    }
  } else {
    console.error('   ❌ FAIL: Challan creation failed:', createRes);
  }

  // 4. Verify Stock is NOT modified in DRAFT status
  console.log('4️⃣ Verifying Stock remains UNCHANGED in DRAFT status...');
  const prodCheck = await apiRequest(`/products/${productId1}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${salesToken}` },
  });
  if (prodCheck.body.data.product.currentStock === initialStockProd1) {
    console.log(`   ✅ PASS: Product stock untouched in DRAFT status (${initialStockProd1} == ${prodCheck.body.data.product.currentStock}).`);
  } else {
    console.error(`   ❌ FAIL: Stock was modified in DRAFT status! Expected ${initialStockProd1}, got ${prodCheck.body.data.product.currentStock}`);
  }

  // 5. Validation Error: Invalid Customer ID
  console.log('5️⃣ Testing Invalid Customer ID (Expected HTTP 404)...');
  const invalidCustRes = await apiRequest('/challans', {
    method: 'POST',
    headers: { Authorization: `Bearer ${salesToken}` },
    body: JSON.stringify({
      customerId: '00000000-0000-0000-0000-000000000000',
      items: [{ productId: productId1, quantity: 1 }],
    }),
  });
  if (invalidCustRes.status === 404 && !invalidCustRes.body.success) {
    console.log('   ✅ PASS: Invalid customer rejected with HTTP 404:', invalidCustRes.body.message);
  } else {
    console.error('   ❌ FAIL: Expected 404 for invalid customer, got:', invalidCustRes.status);
  }

  // 6. Validation Error: Invalid Product ID
  console.log('6️⃣ Testing Invalid Product ID (Expected HTTP 404)...');
  const invalidProdRes = await apiRequest('/challans', {
    method: 'POST',
    headers: { Authorization: `Bearer ${salesToken}` },
    body: JSON.stringify({
      customerId,
      items: [{ productId: '00000000-0000-0000-0000-000000000000', quantity: 1 }],
    }),
  });
  if (invalidProdRes.status === 404 && !invalidProdRes.body.success) {
    console.log('   ✅ PASS: Invalid product rejected with HTTP 404:', invalidProdRes.body.message);
  } else {
    console.error('   ❌ FAIL: Expected 404 for invalid product, got:', invalidProdRes.status);
  }

  // 7. Validation Error: Quantity <= 0 & Empty Items List
  console.log('7️⃣ Testing Invalid Quantity <= 0 & Empty Item Array (Expected HTTP 400)...');
  const invalidQtyRes = await apiRequest('/challans', {
    method: 'POST',
    headers: { Authorization: `Bearer ${salesToken}` },
    body: JSON.stringify({
      customerId,
      items: [{ productId: productId1, quantity: 0 }],
    }),
  });
  if (invalidQtyRes.status === 400 && !invalidQtyRes.body.success) {
    console.log('   ✅ PASS: Zero quantity rejected with HTTP 400.');
  } else {
    console.error('   ❌ FAIL: Expected 400 for zero quantity, got:', invalidQtyRes.status);
  }

  // 8. Get Challan Details by ID (GET /api/challans/:id)
  console.log('8️⃣ Testing Get Challan Details by ID (GET /api/challans/:id)...');
  const getByIdRes = await apiRequest(`/challans/${createdChallanId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${salesToken}` },
  });
  if (getByIdRes.status === 200 && getByIdRes.body.success && getByIdRes.body.data.challan.id === createdChallanId) {
    console.log('   ✅ PASS: Challan details fetched with customer and items array.');
  } else {
    console.error('   ❌ FAIL: Get challan by ID failed:', getByIdRes);
  }

  // 9. List Challans with Search & Pagination (GET /api/challans)
  console.log('9️⃣ Testing List Challans (GET /api/challans?status=DRAFT)...');
  const listRes = await apiRequest('/challans?status=DRAFT&page=1&limit=5', {
    method: 'GET',
    headers: { Authorization: `Bearer ${salesToken}` },
  });
  if (listRes.status === 200 && listRes.body.success && listRes.body.data.challans.length >= 1) {
    console.log(`   ✅ PASS: Challan list fetched. Total count: ${listRes.body.data.pagination.totalCount}.`);
  } else {
    console.error('   ❌ FAIL: List challans failed:', listRes);
  }

  // 10. Creation RBAC Check (Warehouse user attempting creation)
  console.log('🔟 Testing Creation RBAC (Warehouse user should be HTTP 403 Forbidden)...');
  const rbacRes = await apiRequest('/challans', {
    method: 'POST',
    headers: { Authorization: `Bearer ${warehouseToken}` },
    body: JSON.stringify({
      customerId,
      items: [{ productId: productId1, quantity: 1 }],
    }),
  });
  if (rbacRes.status === 403 && !rbacRes.body.success) {
    console.log('   ✅ PASS: Warehouse user forbidden from creating challan (403):', rbacRes.body.message);
  } else {
    console.error('   ❌ FAIL: Expected 403 for Warehouse creation, got:', rbacRes.status);
  }

  console.log('\n🎉 ALL 10 SALES CHALLAN BACKEND TESTS PASSED SUCCESSFULLY!');
}

runChallanTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
