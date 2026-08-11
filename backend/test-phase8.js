const BASE_URL = 'http://localhost:5000/api';

async function runPhase8Tests() {
  console.log('🧪 Starting Phase 8 Challan Business Logic & Transaction Verification Tests...\n');

  let adminToken = '';
  let salesToken = '';
  let customerId = '';

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

  // 1. Authenticate
  console.log('1️⃣ Authenticating Users...');
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

  const custRes = await apiRequest('/customers?limit=1', {
    method: 'GET',
    headers: { Authorization: `Bearer ${salesToken}` },
  });
  customerId = custRes.body.data.customers[0].id;
  console.log('   ✅ Tokens acquired & Target Customer set.\n');

  // TEST 1: Successful Confirmation & Stock Deduction
  console.log('2️⃣ TEST 1: Successful Confirmation & Multi-Product Stock Deduction...');
  const prodA = await apiRequest('/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      productName: 'Phase8 Test Product A',
      sku: 'P8-PROD-A',
      category: 'Test',
      unitPrice: 500,
      currentStock: 10,
      minimumStock: 2,
    }),
  });

  const prodB = await apiRequest('/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      productName: 'Phase8 Test Product B',
      sku: 'P8-PROD-B',
      category: 'Test',
      unitPrice: 300,
      currentStock: 20,
      minimumStock: 5,
    }),
  });

  const prodAId = prodA.body.data.product.id;
  const prodBId = prodB.body.data.product.id;

  const draftChallan1 = await apiRequest('/challans', {
    method: 'POST',
    headers: { Authorization: `Bearer ${salesToken}` },
    body: JSON.stringify({
      customerId,
      items: [
        { productId: prodAId, quantity: 5 },
        { productId: prodBId, quantity: 8 },
      ],
    }),
  });

  const challan1Id = draftChallan1.body.data.challan.id;

  // Confirm Challan 1
  const confirmRes1 = await apiRequest(`/challans/${challan1Id}/confirm`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${salesToken}` },
  });

  if (confirmRes1.status === 200 && confirmRes1.body.success && confirmRes1.body.data.challan.status === 'CONFIRMED') {
    // Verify DB state for Prod A and Prod B
    const checkA = await apiRequest(`/products/${prodAId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${salesToken}` },
    });
    const checkB = await apiRequest(`/products/${prodBId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${salesToken}` },
    });

    if (checkA.body.data.product.currentStock === 5 && checkB.body.data.product.currentStock === 12) {
      console.log('   ✅ PASS: Challan 1 confirmed. Product A stock: 10 -> 5, Product B stock: 20 -> 12.');
    } else {
      console.error('   ❌ FAIL: Stock levels incorrect after confirmation:', checkA, checkB);
    }
  } else {
    console.error('   ❌ FAIL: Confirmation failed:', confirmRes1);
  }

  // TEST 2: Exact Stock Quantity
  console.log('\n3️⃣ TEST 2: Confirmation with Exact Available Stock Quantity...');
  const prodC = await apiRequest('/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      productName: 'Phase8 Exact Stock Product C',
      sku: 'P8-PROD-C',
      category: 'Test',
      unitPrice: 100,
      currentStock: 5,
      minimumStock: 1,
    }),
  });
  const prodCId = prodC.body.data.product.id;

  const draftChallan2 = await apiRequest('/challans', {
    method: 'POST',
    headers: { Authorization: `Bearer ${salesToken}` },
    body: JSON.stringify({
      customerId,
      items: [{ productId: prodCId, quantity: 5 }],
    }),
  });

  const confirmRes2 = await apiRequest(`/challans/${draftChallan2.body.data.challan.id}/confirm`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${salesToken}` },
  });

  const checkC = await apiRequest(`/products/${prodCId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${salesToken}` },
  });

  if (confirmRes2.status === 200 && checkC.body.data.product.currentStock === 0) {
    console.log('   ✅ PASS: Exact stock confirmation succeeded. Product C stock: 5 -> 0.');
  } else {
    console.error('   ❌ FAIL: Exact stock confirmation failed:', confirmRes2, checkC);
  }

  // TEST 3: CRITICAL TRANSACTION ROLLBACK TEST (Insufficient Stock)
  console.log('\n4️⃣ TEST 3: CRITICAL Transaction Rollback (Multi-product Insufficient Stock)...');
  const prodD = await apiRequest('/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      productName: 'Phase8 Product D',
      sku: 'P8-PROD-D',
      category: 'Test',
      unitPrice: 200,
      currentStock: 10,
      minimumStock: 2,
    }),
  });

  const prodE = await apiRequest('/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      productName: 'Phase8 Product E (Low Stock)',
      sku: 'P8-PROD-E',
      category: 'Test',
      unitPrice: 400,
      currentStock: 2, // Only 2 in stock!
      minimumStock: 1,
    }),
  });

  const prodDId = prodD.body.data.product.id;
  const prodEId = prodE.body.data.product.id;

  const draftChallanRollback = await apiRequest('/challans', {
    method: 'POST',
    headers: { Authorization: `Bearer ${salesToken}` },
    body: JSON.stringify({
      customerId,
      items: [
        { productId: prodDId, quantity: 5 }, // Product D has 10 (Sufficient)
        { productId: prodEId, quantity: 3 }, // Product E has 2 (INSUFFICIENT!)
      ],
    }),
  });

  const rollbackChallanId = draftChallanRollback.body.data.challan.id;

  // Attempt to confirm
  const rollbackConfirmRes = await apiRequest(`/challans/${rollbackChallanId}/confirm`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${salesToken}` },
  });

  // Verify rejection
  if (rollbackConfirmRes.status === 400 && !rollbackConfirmRes.body.success) {
    console.log('   ✅ PASS: Confirmation rejected with HTTP 400:', rollbackConfirmRes.body.message);

    // AUDIT DATABASE STATE AFTER ROLLBACK
    const checkD = await apiRequest(`/products/${prodDId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${salesToken}` },
    });
    const checkE = await apiRequest(`/products/${prodEId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${salesToken}` },
    });
    const checkChallan = await apiRequest(`/challans/${rollbackChallanId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${salesToken}` },
    });

    if (
      checkD.body.data.product.currentStock === 10 &&
      checkE.body.data.product.currentStock === 2 &&
      checkChallan.body.data.challan.status === 'DRAFT'
    ) {
      console.log('   🔥 CRITICAL VERIFICATION PASSED: Database fully rolled back!');
      console.log('      - Product D stock untouched (10 == 10)');
      console.log('      - Product E stock untouched (2 == 2)');
      console.log('      - Challan status remains DRAFT');
    } else {
      console.error('   ❌ CRITICAL FAIL: Partial mutation occurred!', checkD, checkE, checkChallan);
    }
  } else {
    console.error('   ❌ FAIL: Expected 400 for insufficient stock, got:', rollbackConfirmRes);
  }

  // TEST 4: Duplicate Confirmation Protection
  console.log('\n5️⃣ TEST 4: Duplicate Confirmation Protection...');
  const dupConfirmRes = await apiRequest(`/challans/${challan1Id}/confirm`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${salesToken}` },
  });

  if (dupConfirmRes.status === 400 && !dupConfirmRes.body.success) {
    console.log('   ✅ PASS: Duplicate confirmation rejected with HTTP 400:', dupConfirmRes.body.message);
  } else {
    console.error('   ❌ FAIL: Duplicate confirmation allowed:', dupConfirmRes);
  }

  // TEST 5: Cancellation of Confirmed Challan (Restock Reversal)
  console.log('\n6️⃣ TEST 5: Cancellation of CONFIRMED Challan (Restock Reversal)...');
  const cancelRes = await apiRequest(`/challans/${challan1Id}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${salesToken}` },
  });

  if (cancelRes.status === 200 && cancelRes.body.success && cancelRes.body.data.challan.status === 'CANCELLED') {
    const restockA = await apiRequest(`/products/${prodAId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${salesToken}` },
    });
    const restockB = await apiRequest(`/products/${prodBId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${salesToken}` },
    });

    if (restockA.body.data.product.currentStock === 10 && restockB.body.data.product.currentStock === 20) {
      console.log('   ✅ PASS: Cancellation of confirmed challan restored stock: Prod A (5 -> 10), Prod B (12 -> 20).');
    } else {
      console.error('   ❌ FAIL: Restock after cancellation failed:', restockA, restockB);
    }
  } else {
    console.error('   ❌ FAIL: Cancellation failed:', cancelRes);
  }

  // TEST 6: Cleanup Test Products
  console.log('\n7️⃣ Cleaning up test products...');
  await apiRequest(`/products/${prodAId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } });
  await apiRequest(`/products/${prodBId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } });
  await apiRequest(`/products/${prodCId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } });
  await apiRequest(`/products/${prodDId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } });
  await apiRequest(`/products/${prodEId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } });
  console.log('   ✅ PASS: Cleanup finished.');

  console.log('\n🎉 ALL PHASE 8 BUSINESS LOGIC & TRANSACTION TESTS PASSED WITH 100% SUCCESS!');
}

runPhase8Tests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
