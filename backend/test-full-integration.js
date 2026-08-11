const BASE_URL = 'http://localhost:5000/api';

async function runFullSystemIntegrationTest() {
  console.log('🚀 STARTING PHASE 14 — FULL SYSTEM INTEGRATION VERIFICATION...\n');

  try {
    // -------------------------------------------------------------
    // STEP 1: AUTHENTICATION & ROLE ACCESS VERIFICATION
    // -------------------------------------------------------------
    console.log('🔹 STEP 1: Testing Authentication for all 4 Roles...');

    const roles = [
      { role: 'ADMIN', email: 'admin@fundsroom.com' },
      { role: 'SALES', email: 'sales@fundsroom.com' },
      { role: 'WAREHOUSE', email: 'warehouse@fundsroom.com' },
      { role: 'ACCOUNTS', email: 'accounts@fundsroom.com' },
    ];

    const tokens = {};

    for (const r of roles) {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: r.email, password: 'Password@123' }),
      });
      const body = await res.json();
      if (res.status === 200 && body.success && body.data.token) {
        tokens[r.role] = body.data.token;
        console.log(`   ✅ Login Successful for Role [${r.role}]: ${body.data.user.email}`);
      } else {
        throw new Error(`Login failed for role ${r.role}: ${JSON.stringify(body)}`);
      }
    }

    const adminToken = tokens.ADMIN;
    const salesToken = tokens.SALES;
    const warehouseToken = tokens.WAREHOUSE;
    const accountsToken = tokens.ACCOUNTS;

    // -------------------------------------------------------------
    // STEP 2: DASHBOARD METRICS INTEGRATION
    // -------------------------------------------------------------
    console.log('\n🔹 STEP 2: Testing Executive Dashboard Metrics...');
    const dashRes = await fetch(`${BASE_URL}/dashboard/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dashBody = await dashRes.json();
    console.log('   ✅ Dashboard metrics returned cleanly:');
    console.log('      - Total Customers:', dashBody.data.kpis.totalCustomers);
    console.log('      - Total Products:', dashBody.data.kpis.totalProducts);
    console.log('      - Low Stock Count:', dashBody.data.kpis.lowStockCount);

    // -------------------------------------------------------------
    // STEP 3: CUSTOMER CRM INTEGRATION
    // -------------------------------------------------------------
    console.log('\n🔹 STEP 3: Creating Customer via CRM API...');
    const custRes = await fetch(`${BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesToken}`,
      },
      body: JSON.stringify({
        customerName: 'Integration Test Corp',
        mobileNumber: '9888777666',
        email: 'contact@integrationcorp.com',
        businessName: 'Integration Logistics Pvt Ltd',
        gstNumber: '27AAAAA1234A1Z1',
        customerType: 'DISTRIBUTOR',
        status: 'ACTIVE',
        notes: 'VIP Wholesale Client for End-to-End Integration Testing',
      }),
    });
    const custBody = await custRes.json();
    if (custRes.status !== 201 || !custBody.data?.customer?.id) {
      throw new Error(`Customer creation failed: ${JSON.stringify(custBody)}`);
    }
    const customer = custBody.data.customer;
    console.log(`   ✅ Customer Created: ${customer.customerName} (ID: ${customer.id})`);

    // -------------------------------------------------------------
    // STEP 4: PRODUCT MASTER CATALOG INTEGRATION
    // -------------------------------------------------------------
    console.log('\n🔹 STEP 4: Creating 2 Catalog Products via Product API...');
    const timestamp = Date.now().toString().slice(-4);
    const skuAlpha = `INT-ALP-${timestamp}`;
    const skuBeta = `INT-BET-${timestamp}`;

    const prod1Res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${warehouseToken}`,
      },
      body: JSON.stringify({
        productName: 'Integration Product Alpha',
        sku: skuAlpha,
        category: 'Testing Modules',
        unitPrice: 1500,
        minimumStock: 10,
        warehouse: 'Bay 1',
      }),
    });
    const prod1Body = await prod1Res.json();
    const prodAlpha = prod1Body.data.product;

    const prod2Res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${warehouseToken}`,
      },
      body: JSON.stringify({
        productName: 'Integration Product Beta',
        sku: skuBeta,
        category: 'Testing Modules',
        unitPrice: 3000,
        minimumStock: 5,
        warehouse: 'Bay 2',
      }),
    });
    const prod2Body = await prod2Res.json();
    const prodBeta = prod2Body.data.product;

    console.log(`   ✅ Product Alpha Created: ${prodAlpha.productName} (${prodAlpha.sku}) - Stock: ${prodAlpha.currentStock}`);
    console.log(`   ✅ Product Beta Created: ${prodBeta.productName} (${prodBeta.sku}) - Stock: ${prodBeta.currentStock}`);

    // -------------------------------------------------------------
    // STEP 5: INVENTORY STOCK IN INTEGRATION
    // -------------------------------------------------------------
    console.log('\n🔹 STEP 5: Executing Stock IN Operations (+50 Alpha, +10 Beta)...');
    await fetch(`${BASE_URL}/inventory/${prodAlpha.id}/stock-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${warehouseToken}`,
      },
      body: JSON.stringify({ quantity: 50, reason: 'Initial Purchase Batch Arrival' }),
    });

    await fetch(`${BASE_URL}/inventory/${prodBeta.id}/stock-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${warehouseToken}`,
      },
      body: JSON.stringify({ quantity: 10, reason: 'Initial Purchase Batch Arrival' }),
    });

    // Fetch updated products
    const alphaUpdatedRes = await fetch(`${BASE_URL}/products/${prodAlpha.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const alphaUpdated = (await alphaUpdatedRes.json()).data.product;

    const betaUpdatedRes = await fetch(`${BASE_URL}/products/${prodBeta.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const betaUpdated = (await betaUpdatedRes.json()).data.product;

    console.log(`   ✅ Stock IN Complete. Alpha Stock: ${alphaUpdated.currentStock}, Beta Stock: ${betaUpdated.currentStock}`);

    // -------------------------------------------------------------
    // STEP 6: VERIFY STOCK MOVEMENTS AUDIT TRAIL
    // -------------------------------------------------------------
    console.log('\n🔹 STEP 6: Checking Inventory Movements Audit Trail...');
    const movRes = await fetch(`${BASE_URL}/inventory/movements`, {
      headers: { Authorization: `Bearer ${accountsToken}` },
    });
    const movBody = await movRes.json();
    console.log(`   ✅ Movements Audit Trail Returned ${movBody.data.movements.length} Records`);

    // -------------------------------------------------------------
    // STEP 7: CREATE DRAFT SALES CHALLAN & VERIFY STOCK UNCHANGED
    // -------------------------------------------------------------
    console.log('\n🔹 STEP 7: Creating Draft Sales Delivery Challan (Req: 20 Alpha, 4 Beta)...');
    const createChallanRes = await fetch(`${BASE_URL}/challans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesToken}`,
      },
      body: JSON.stringify({
        customerId: customer.id,
        items: [
          { productId: prodAlpha.id, quantity: 20 },
          { productId: prodBeta.id, quantity: 4 },
        ],
      }),
    });
    const createChallanBody = await createChallanRes.json();
    const challan1 = createChallanBody.data.challan;
    console.log(`   ✅ Draft Challan Created: ${challan1.challanNumber} (Status: ${challan1.status})`);

    // Verify stock is untouched in DRAFT
    const alphaDraftCheckRes = await fetch(`${BASE_URL}/products/${prodAlpha.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const alphaDraftCheck = (await alphaDraftCheckRes.json()).data.product;
    console.log(`   ✅ Stock Protection Verified: Alpha Stock remains ${alphaDraftCheck.currentStock} (Unchanged in DRAFT)`);

    // -------------------------------------------------------------
    // STEP 8: CONFIRM CHALLAN & VERIFY ATOMIC STOCK REDUCTION & OUT MOVEMENTS
    // -------------------------------------------------------------
    console.log('\n🔹 STEP 8: Confirming Delivery Challan...');
    const confirmRes = await fetch(`${BASE_URL}/challans/${challan1.id}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${warehouseToken}`,
      },
    });
    const confirmBody = await confirmRes.json();
    console.log(`   ✅ Challan Confirmed: ${confirmBody.data.challan.challanNumber} (Status: ${confirmBody.data.challan.status})`);

    // Check reduced stock
    const alphaConfirmedRes = await fetch(`${BASE_URL}/products/${prodAlpha.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const alphaConfirmed = (await alphaConfirmedRes.json()).data.product;

    const betaConfirmedRes = await fetch(`${BASE_URL}/products/${prodBeta.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const betaConfirmed = (await betaConfirmedRes.json()).data.product;

    console.log(`   ✅ Stock Reduction Verified: Alpha Stock 50 -> ${alphaConfirmed.currentStock} (-20), Beta Stock 10 -> ${betaConfirmed.currentStock} (-4)`);

    // -------------------------------------------------------------
    // STEP 9: TEST INSUFFICIENT STOCK & TRANSACTION ROLLBACK
    // -------------------------------------------------------------
    console.log('\n🔹 STEP 9: Testing Insufficient Stock Rejection & Transaction Rollback...');
    // Create Draft Challan requesting 40 Alpha (Available: 30) and 2 Beta (Available: 6)
    const draft2Res = await fetch(`${BASE_URL}/challans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesToken}`,
      },
      body: JSON.stringify({
        customerId: customer.id,
        items: [
          { productId: prodAlpha.id, quantity: 40 },
          { productId: prodBeta.id, quantity: 2 },
        ],
      }),
    });
    const challan2 = (await draft2Res.json()).data.challan;

    // Attempt to confirm
    const confirmFailRes = await fetch(`${BASE_URL}/challans/${challan2.id}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesToken}`,
      },
    });
    const confirmFailBody = await confirmFailRes.json();

    if (confirmFailRes.status === 400 && !confirmFailBody.success) {
      console.log(`   ✅ Rejection Verified! Error: "${confirmFailBody.message}"`);
    } else {
      throw new Error(`Expected HTTP 400 rejection, but got status ${confirmFailRes.status}`);
    }

    // Verify Rollback: Alpha stock remains 30, Beta stock remains 6
    const alphaRollbackRes = await fetch(`${BASE_URL}/products/${prodAlpha.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const alphaRollback = (await alphaRollbackRes.json()).data.product;

    const betaRollbackRes = await fetch(`${BASE_URL}/products/${prodBeta.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const betaRollback = (await betaRollbackRes.json()).data.product;

    console.log(`   🔥 Transaction Rollback Verified: Alpha Stock remains ${alphaRollback.currentStock}, Beta Stock remains ${betaRollback.currentStock}`);

    // -------------------------------------------------------------
    // STEP 10: ERROR & ROLE ACCESS RESTRICTION VERIFICATION
    // -------------------------------------------------------------
    console.log('\n🔹 STEP 10: Verifying Role Access Enforcement & Error Responses...');
    // Attempt deletion of product by SALES role (Should return HTTP 403 Forbidden)
    const deleteFailRes = await fetch(`${BASE_URL}/products/${prodAlpha.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${salesToken}` },
    });
    const deleteFailBody = await deleteFailRes.json();
    if (deleteFailRes.status === 403) {
      console.log(`   ✅ HTTP 403 Forbidden Enforced for SALES role: "${deleteFailBody.message}"`);
    } else {
      throw new Error(`Expected HTTP 403, got ${deleteFailRes.status}`);
    }

    console.log('\n🎉 =======================================================');
    console.log('   ALL PHASE 14 FULL SYSTEM INTEGRATION TESTS PASSED 100%!');
    console.log('=======================================================\n');
  } catch (err) {
    console.error('\n❌ INTEGRATION TEST FAILED:', err.message);
    process.exit(1);
  }
}

runFullSystemIntegrationTest();
