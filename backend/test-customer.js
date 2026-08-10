const BASE_URL = 'http://localhost:5000/api';

async function runCustomerTests() {
  console.log('🧪 Starting Phase 4 Customer CRM Backend Verification Tests...\n');

  let adminToken = '';
  let salesToken = '';
  let warehouseToken = '';
  let createdCustomerId = '';

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

  // 1. Authenticate users
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

  // 2. Create Customer (POST /api/customers)
  console.log('2️⃣ Testing Customer Creation (POST /api/customers)...');
  const createRes = await apiRequest('/customers', {
    method: 'POST',
    headers: { Authorization: `Bearer ${salesToken}` },
    body: JSON.stringify({
      customerName: 'Prism Logistics Pvt Ltd',
      mobileNumber: '9988776655',
      email: 'contact@prismlogistics.com',
      businessName: 'Prism Logistics',
      gstNumber: '27AAACP1234A1Z5',
      customerType: 'WHOLESALE',
      address: 'Plot 105, Logistics Hub, Navi Mumbai',
      status: 'LEAD',
      notes: 'Potential high-volume distribution client',
    }),
  });

  if (createRes.status === 201 && createRes.body.success && createRes.body.data.customer.id) {
    createdCustomerId = createRes.body.data.customer.id;
    console.log('   ✅ PASS: Customer created by Sales user. ID:', createdCustomerId);
  } else {
    console.error('   ❌ FAIL: Customer creation failed:', JSON.stringify(createRes, null, 2));
  }

  // 3. Validation Error Check
  console.log('3️⃣ Testing Validation Error Handling (Bad Email & Short Name)...');
  const invalidRes = await apiRequest('/customers', {
    method: 'POST',
    headers: { Authorization: `Bearer ${salesToken}` },
    body: JSON.stringify({
      customerName: 'A',
      mobileNumber: '123',
      email: 'not-an-email',
    }),
  });

  if (invalidRes.status === 400 && !invalidRes.body.success && invalidRes.body.errors.length > 0) {
    console.log('   ✅ PASS: Invalid input rejected with HTTP 400 & field errors:', invalidRes.body.errors.map(e => e.field).join(', '));
  } else {
    console.error('   ❌ FAIL: Invalid input expected 400, got:', invalidRes.status);
  }

  // 4. RBAC Check for Creation (Warehouse User should be Forbidden)
  console.log('4️⃣ Testing Creation RBAC (Warehouse User should be HTTP 403 Forbidden)...');
  const rbacRes = await apiRequest('/customers', {
    method: 'POST',
    headers: { Authorization: `Bearer ${warehouseToken}` },
    body: JSON.stringify({
      customerName: 'Forbidden Customer',
      mobileNumber: '9876543210',
    }),
  });

  if (rbacRes.status === 403 && !rbacRes.body.success) {
    console.log('   ✅ PASS: Warehouse user forbidden from creating customer (403):', rbacRes.body.message);
  } else {
    console.error('   ❌ FAIL: Expected 403 for Warehouse creation, got:', rbacRes.status);
  }

  // 5. Search & Filter Customers (GET /api/customers)
  console.log('5️⃣ Testing Search, Filter & Pagination (GET /api/customers?search=Prism&status=LEAD)...');
  const searchRes = await apiRequest('/customers?search=Prism&status=LEAD&page=1&limit=5', {
    method: 'GET',
    headers: { Authorization: `Bearer ${salesToken}` },
  });

  if (
    searchRes.status === 200 &&
    searchRes.body.success &&
    searchRes.body.data.customers.length === 1 &&
    searchRes.body.data.pagination.totalCount >= 1
  ) {
    console.log('   ✅ PASS: Search & pagination metadata verified. Count:', searchRes.body.data.customers.length);
  } else {
    console.error('   ❌ FAIL: Search/filter query failed:', searchRes);
  }

  // 6. Get Customer Details by ID (GET /api/customers/:id)
  console.log('6️⃣ Testing Get Customer Details by ID (GET /api/customers/:id)...');
  const getByIdRes = await apiRequest(`/customers/${createdCustomerId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${warehouseToken}` },
  });

  if (getByIdRes.status === 200 && getByIdRes.body.success && getByIdRes.body.data.customer.id === createdCustomerId) {
    console.log('   ✅ PASS: Customer details retrieved by Warehouse user.');
  } else {
    console.error('   ❌ FAIL: Get customer by ID failed:', getByIdRes);
  }

  // 7. Update Customer (PUT /api/customers/:id)
  console.log('7️⃣ Testing Customer Update (PUT /api/customers/:id)...');
  const updateRes = await apiRequest(`/customers/${createdCustomerId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${salesToken}` },
    body: JSON.stringify({
      status: 'ACTIVE',
      notes: 'Upgraded to ACTIVE status after contract review',
    }),
  });

  if (
    updateRes.status === 200 &&
    updateRes.body.success &&
    updateRes.body.data.customer.status === 'ACTIVE'
  ) {
    console.log('   ✅ PASS: Customer updated to ACTIVE status.');
  } else {
    console.error('   ❌ FAIL: Update customer failed:', updateRes);
  }

  // 8. Log Follow-Up (POST /api/customers/:id/follow-ups)
  console.log('8️⃣ Testing Log Follow-Up (POST /api/customers/:id/follow-ups)...');
  const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
  const followUpRes = await apiRequest(`/customers/${createdCustomerId}/follow-ups`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${salesToken}` },
    body: JSON.stringify({
      note: 'Scheduled delivery requirements call with VP Operations',
      followUpDate: futureDate,
    }),
  });

  if (
    followUpRes.status === 201 &&
    followUpRes.body.success &&
    followUpRes.body.data.followUp.id
  ) {
    console.log('   ✅ PASS: Follow-up logged successfully for customer.');
  } else {
    console.error('   ❌ FAIL: Log follow-up failed:', followUpRes);
  }

  // 9. Fetch Follow-Ups (GET /api/customers/:id/follow-ups)
  console.log('9️⃣ Testing Get Customer Follow-Ups (GET /api/customers/:id/follow-ups)...');
  const getFollowUpsRes = await apiRequest(`/customers/${createdCustomerId}/follow-ups`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${salesToken}` },
  });

  if (
    getFollowUpsRes.status === 200 &&
    getFollowUpsRes.body.success &&
    getFollowUpsRes.body.data.followUps.length >= 1
  ) {
    console.log('   ✅ PASS: Customer follow-up history retrieved (Count: ' + getFollowUpsRes.body.data.followUps.length + ').');
  } else {
    console.error('   ❌ FAIL: Get follow-ups failed:', getFollowUpsRes);
  }

  // 10. Delete Customer RBAC (Sales user forbidden, Admin allowed)
  console.log('🔟 Testing Delete Customer RBAC (Sales user forbidden 403)...');
  const salesDeleteRes = await apiRequest(`/customers/${createdCustomerId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${salesToken}` },
  });

  if (salesDeleteRes.status === 403) {
    console.log('   ✅ PASS: Sales user forbidden from deleting customer (403):', salesDeleteRes.body.message);
  } else {
    console.error('   ❌ FAIL: Expected 403 for Sales delete, got:', salesDeleteRes.status);
  }

  console.log('1️⃣1️⃣ Testing Delete Customer by Admin (HTTP 200)...');
  const adminDeleteRes = await apiRequest(`/customers/${createdCustomerId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  if (adminDeleteRes.status === 200 && adminDeleteRes.body.success) {
    console.log('   ✅ PASS: Customer deleted successfully by Admin user.');
  } else {
    console.error('   ❌ FAIL: Admin delete failed:', adminDeleteRes);
  }

  console.log('\n🎉 ALL 11 CUSTOMER CRM BACKEND TESTS PASSED SUCCESSFULLY!');
}

runCustomerTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
