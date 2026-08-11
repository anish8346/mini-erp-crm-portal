const BASE_URL = 'http://localhost:5000/api';

async function runPhase15QASuite() {
  console.log('🧪 ========================================================');
  console.log('   STARTING PHASE 15 — COMPLETE QA & EDGE CASE SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      passed++;
      console.log(`   ✅ PASS: ${testName} ${detail ? `(${detail})` : ''}`);
    } else {
      failed++;
      console.error(`   ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    }
  }

  try {
    // -------------------------------------------------------------
    // 1. AUTHENTICATION & TOKEN EDGE CASES
    // -------------------------------------------------------------
    console.log('🔹 1. AUTHENTICATION & JWT TOKEN TESTS');

    // Valid Login
    const validLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@fundsroom.com', password: 'Password@123' }),
    });
    const validLoginBody = await validLoginRes.json();
    assert(validLoginRes.status === 200 && validLoginBody.success, 'Valid Login (Admin)', `Token length: ${validLoginBody.data?.token?.length}`);
    const adminToken = validLoginBody.data.token;

    // Invalid Email
    const invalidEmailRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@fundsroom.com', password: 'Password@123' }),
    });
    assert(invalidEmailRes.status === 401, 'Invalid Email Login Rejection', `Status: ${invalidEmailRes.status}`);

    // Invalid Password
    const invalidPassRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@fundsroom.com', password: 'WrongPassword' }),
    });
    assert(invalidPassRes.status === 401, 'Invalid Password Login Rejection', `Status: ${invalidPassRes.status}`);

    // Missing Token Header
    const missingTokenRes = await fetch(`${BASE_URL}/auth/me`);
    assert(missingTokenRes.status === 401, 'Missing Token Header Rejection', `Status: ${missingTokenRes.status}`);

    // Invalid Token String
    const invalidTokenRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: 'Bearer INVALID_JWT_STRING_123' },
    });
    assert(invalidTokenRes.status === 401, 'Malformed JWT Token Rejection', `Status: ${invalidTokenRes.status}`);

    // -------------------------------------------------------------
    // 2. AUTHORIZATION & ROLE PERMISSION TESTS
    // -------------------------------------------------------------
    console.log('\n🔹 2. AUTHORIZATION & RBAC ENFORCEMENT TESTS');

    // Login Sales Role
    const salesLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sales@fundsroom.com', password: 'Password@123' }),
    });
    const salesToken = (await salesLoginRes.json()).data.token;

    // Login Warehouse Role
    const whLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'warehouse@fundsroom.com', password: 'Password@123' }),
    });
    const whToken = (await whLoginRes.json()).data.token;

    // Login Accounts Role
    const accLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'accounts@fundsroom.com', password: 'Password@123' }),
    });
    const accToken = (await accLoginRes.json()).data.token;

    // Test: SALES cannot delete a customer
    const salesDeleteCustRes = await fetch(`${BASE_URL}/customers/some-id`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${salesToken}` },
    });
    assert(salesDeleteCustRes.status === 403, 'SALES Role Customer Deletion Forbidden', `Status: ${salesDeleteCustRes.status}`);

    // Test: ACCOUNTS cannot create a product
    const accCreateProdRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accToken}` },
      body: JSON.stringify({ productName: 'Test', sku: 'SKU123', category: 'Cat', unitPrice: 10, minimumStock: 5 }),
    });
    assert(accCreateProdRes.status === 403, 'ACCOUNTS Role Product Creation Forbidden', `Status: ${accCreateProdRes.status}`);

    // -------------------------------------------------------------
    // 3. PRODUCT VALIDATION & DUPLICATE SKU EDGE CASES
    // -------------------------------------------------------------
    console.log('\n🔹 3. PRODUCT CATALOG VALIDATION & SKU EDGE CASES');

    const timestamp = Date.now().toString().slice(-4);
    const skuUnique = `QA-SKU-${timestamp}`;

    // Valid Product Creation by WAREHOUSE
    const createProdRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${whToken}` },
      body: JSON.stringify({
        productName: 'QA Test Motor',
        sku: skuUnique,
        category: 'Motors',
        unitPrice: 2500,
        minimumStock: 5,
        warehouse: 'QA Bay',
      }),
    });
    const createProdBody = await createProdRes.json();
    assert(createProdRes.status === 201, 'Valid Product Creation', `SKU: ${skuUnique}`);
    const qaProd = createProdBody.data.product;

    // Duplicate SKU Rejection (HTTP 400 / 409)
    const dupSkuRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${whToken}` },
      body: JSON.stringify({
        productName: 'Duplicate SKU Product',
        sku: skuUnique,
        category: 'Motors',
        unitPrice: 1000,
        minimumStock: 5,
      }),
    });
    assert(dupSkuRes.status === 400 || dupSkuRes.status === 409, 'Duplicate SKU Unique Constraint Rejection', `Status: ${dupSkuRes.status}`);

    // Invalid Negative Price Rejection
    const negPriceRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${whToken}` },
      body: JSON.stringify({
        productName: 'Negative Price Product',
        sku: `NEG-${timestamp}`,
        category: 'Motors',
        unitPrice: -50,
        minimumStock: 5,
      }),
    });
    assert(negPriceRes.status === 400, 'Negative Unit Price Rejection', `Status: ${negPriceRes.status}`);

    // -------------------------------------------------------------
    // 4. INVENTORY EDGE CASES (Zero / Negative Quantity)
    // -------------------------------------------------------------
    console.log('\n🔹 4. INVENTORY EDGE CASE TESTS');

    // Zero Quantity Stock IN
    const zeroStockInRes = await fetch(`${BASE_URL}/inventory/${qaProd.id}/stock-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${whToken}` },
      body: JSON.stringify({ quantity: 0, reason: 'Test Zero' }),
    });
    assert(zeroStockInRes.status === 400, 'Zero Quantity Stock IN Rejection', `Status: ${zeroStockInRes.status}`);

    // Negative Quantity Stock IN
    const negStockInRes = await fetch(`${BASE_URL}/inventory/${qaProd.id}/stock-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${whToken}` },
      body: JSON.stringify({ quantity: -10, reason: 'Test Negative' }),
    });
    assert(negStockInRes.status === 400, 'Negative Quantity Stock IN Rejection', `Status: ${negStockInRes.status}`);

    // Insufficient Stock OUT Attempt (Current stock is 0, request 5)
    const outFailRes = await fetch(`${BASE_URL}/inventory/${qaProd.id}/stock-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${whToken}` },
      body: JSON.stringify({ quantity: 5, reason: 'Overdraw' }),
    });
    assert(outFailRes.status === 400, 'Insufficient Stock OUT Rejection', `Status: ${outFailRes.status}`);

    // -------------------------------------------------------------
    // 5. CRITICAL TRANSACTION ROLLBACK TEST
    // -------------------------------------------------------------
    console.log('\n🔹 5. CRITICAL ATOMIC DATABASE TRANSACTION ROLLBACK TEST');

    // Create Customer
    const customerRes = await fetch(`${BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${salesToken}` },
      body: JSON.stringify({
        customerName: 'Transaction QA Client',
        mobileNumber: '9777666555',
        customerType: 'WHOLESALE',
        status: 'ACTIVE',
      }),
    });
    const customer = (await customerRes.json()).data.customer;

    // Create Product A (Stock 10, Request 5)
    const prodARes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${whToken}` },
      body: JSON.stringify({
        productName: 'QA Product A (Stock 10)',
        sku: `TX-A-${timestamp}`,
        category: 'TX Test',
        unitPrice: 100,
        minimumStock: 1,
      }),
    });
    const prodA = (await prodARes.json()).data.product;

    // Create Product B (Stock 2, Request 3)
    const prodBRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${whToken}` },
      body: JSON.stringify({
        productName: 'QA Product B (Stock 2)',
        sku: `TX-B-${timestamp}`,
        category: 'TX Test',
        unitPrice: 200,
        minimumStock: 1,
      }),
    });
    const prodB = (await prodBRes.json()).data.product;

    // Set Stock A = 10, Stock B = 2 via Stock IN
    await fetch(`${BASE_URL}/inventory/${prodA.id}/stock-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${whToken}` },
      body: JSON.stringify({ quantity: 10, reason: 'Initial Setup' }),
    });

    await fetch(`${BASE_URL}/inventory/${prodB.id}/stock-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${whToken}` },
      body: JSON.stringify({ quantity: 2, reason: 'Initial Setup' }),
    });

    // Create Draft Challan (Product A: 5, Product B: 3)
    const txChallanRes = await fetch(`${BASE_URL}/challans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${salesToken}` },
      body: JSON.stringify({
        customerId: customer.id,
        items: [
          { productId: prodA.id, quantity: 5 },
          { productId: prodB.id, quantity: 3 },
        ],
      }),
    });
    const txChallan = (await txChallanRes.json()).data.challan;

    // Confirm Challan (Must Fail because Product B requested 3 when available is 2)
    const txConfirmRes = await fetch(`${BASE_URL}/challans/${txChallan.id}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${salesToken}` },
    });
    const txConfirmBody = await txConfirmRes.json();
    assert(txConfirmRes.status === 400 && !txConfirmBody.success, 'Transaction Confirmation Rejected (HTTP 400)', `Message: "${txConfirmBody.message}"`);

    // Verify Product A remains 10
    const prodACheckRes = await fetch(`${BASE_URL}/products/${prodA.id}`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const prodACheck = (await prodACheckRes.json()).data.product;
    assert(prodACheck.currentStock === 10, 'Product A Stock Unchanged (Rollback Verified)', `Stock: ${prodACheck.currentStock} (Expected: 10)`);

    // Verify Product B remains 2
    const prodBCheckRes = await fetch(`${BASE_URL}/products/${prodB.id}`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const prodBCheck = (await prodBCheckRes.json()).data.product;
    assert(prodBCheck.currentStock === 2, 'Product B Stock Unchanged (Rollback Verified)', `Stock: ${prodBCheck.currentStock} (Expected: 2)`);

    // Verify Challan remains DRAFT
    const challanCheckRes = await fetch(`${BASE_URL}/challans/${txChallan.id}`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const challanCheck = (await challanCheckRes.json()).data.challan;
    assert(challanCheck.status === 'DRAFT', 'Challan Status Remains DRAFT', `Status: ${challanCheck.status}`);

    // -------------------------------------------------------------
    // 6. EXACT STOCK CONFIRMATION & DUPLICATE CONFIRMATION
    // -------------------------------------------------------------
    console.log('\n🔹 6. EXACT STOCK & DUPLICATE CONFIRMATION TESTS');

    // Create Draft Challan requesting exactly 2 units of Product B (Stock: 2)
    const exactChallanRes = await fetch(`${BASE_URL}/challans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${salesToken}` },
      body: JSON.stringify({
        customerId: customer.id,
        items: [{ productId: prodB.id, quantity: 2 }],
      }),
    });
    const exactChallan = (await exactChallanRes.json()).data.challan;

    // Confirm Exact Stock Challan
    const exactConfirmRes = await fetch(`${BASE_URL}/challans/${exactChallan.id}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${whToken}` },
    });
    assert(exactConfirmRes.status === 200, 'Exact Available Stock Confirmation Success', `Status: ${exactConfirmRes.status}`);

    // Verify Product B stock becomes 0
    const prodBZeroRes = await fetch(`${BASE_URL}/products/${prodB.id}`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const prodBZero = (await prodBZeroRes.json()).data.product;
    assert(prodBZero.currentStock === 0, 'Product B Stock Reduced to Exactly 0', `Stock: ${prodBZero.currentStock}`);

    // Attempt Duplicate Confirmation on already CONFIRMED challan
    const dupConfirmRes = await fetch(`${BASE_URL}/challans/${exactChallan.id}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${whToken}` },
    });
    assert(dupConfirmRes.status === 400, 'Duplicate Confirmation Rejection', `Status: ${dupConfirmRes.status}`);

    console.log('\n========================================================');
    console.log(`📊 QA RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('\n❌ QA SUITE FAILED WITH EXCEPTION:', err);
    process.exit(1);
  }
}

runPhase15QASuite();
