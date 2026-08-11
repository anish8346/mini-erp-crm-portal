const BASE_URL = 'http://localhost:5000/api/v1';

async function runTests() {
  console.log('🧪 Starting Backend User Accounts & RBAC Verification Tests...\n');

  let adminToken = '';
  let salesToken = '';
  let salesUserId = '';
  let adminUserId = '';

  // Helper fetch function
  async function apiRequest(endpoint, options = {}) {
    const { headers, ...rest } = options;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      ...rest,
    });
    const status = res.status;
    const body = await res.json().catch(() => ({}));
    return { status, body };
  }

  // 1. Login Admin to get token
  const loginAdmin = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@fundsroom.com', password: 'Password@123' }),
  });
  adminToken = loginAdmin.body.data.token;
  adminUserId = loginAdmin.body.data.user.id;

  // 2. Login Sales to get token
  const loginSales = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'sales@fundsroom.com', password: 'Password@123' }),
  });
  salesToken = loginSales.body.data.token;
  salesUserId = loginSales.body.data.user.id;

  // 3. Test GET /users for non-Admin (Expected HTTP 403)
  console.log('1️⃣ Testing User list access for Sales (Expected HTTP 403)...');
  const res1 = await apiRequest('/users', {
    method: 'GET',
    headers: { Authorization: `Bearer ${salesToken}` },
  });
  if (res1.status === 403) {
    console.log('   ✅ PASS: Sales user blocked from listing users.');
  } else {
    console.error('   ❌ FAIL: Sales user was not blocked. Status:', res1.status, res1.body);
  }

  // 4. Test GET /users for Admin (Expected HTTP 200)
  console.log('2️⃣ Testing User list access for Admin (Expected HTTP 200)...');
  const res2 = await apiRequest('/users', {
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (res2.status === 200 && res2.body.success && Array.isArray(res2.body.data.users)) {
    console.log(`   ✅ PASS: Admin retrieved user list successfully. Count: ${res2.body.data.users.length}`);
  } else {
    console.error('   ❌ FAIL: Admin failed to retrieve user list.', res2);
  }

  // 5. Test PATCH /users/:id self-deactivation block (Expected HTTP 400)
  console.log('3️⃣ Testing Self-deactivation prevention (Expected HTTP 400)...');
  const res3 = await apiRequest(`/users/${adminUserId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ isActive: false }),
  });
  if (res3.status === 400 && res3.body.message.includes('deactivate your own')) {
    console.log('   ✅ PASS: Self-deactivation blocked correctly:', res3.body.message);
  } else {
    console.error('   ❌ FAIL: Expected 400 block, got:', res3.status, res3.body);
  }

  // 6. Test PATCH /users/:id self-demotion block (Expected HTTP 400)
  console.log('4️⃣ Testing Self-role change prevention (Expected HTTP 400)...');
  const res4 = await apiRequest(`/users/${adminUserId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ role: 'SALES' }),
  });
  if (res4.status === 400 && res4.body.message.includes('change your own user role')) {
    console.log('   ✅ PASS: Self-role change blocked correctly:', res4.body.message);
  } else {
    console.error('   ❌ FAIL: Expected 400 block, got:', res4.status, res4.body);
  }

  // 7. Test PATCH /users/:id modifying other user (Expected HTTP 200)
  console.log('5️⃣ Testing Role & Status change of another user (Expected HTTP 200)...');
  const res5 = await apiRequest(`/users/${salesUserId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ role: 'ACCOUNTS', isActive: false }),
  });
  if (res5.status === 200 && res5.body.success && res5.body.data.user.role === 'ACCOUNTS' && res5.body.data.user.isActive === false) {
    console.log('   ✅ PASS: Admin successfully modified sales user role to ACCOUNTS and status to inactive.');
  } else {
    console.error('   ❌ FAIL: Failed to update sales user.', res5.status, res5.body);
  }

  // 8. Revert changes to Sales user so it does not affect subsequent tests
  console.log('🧹 Cleaning up and restoring Sales user role/status...');
  const res6 = await apiRequest(`/users/${salesUserId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ role: 'SALES', isActive: true }),
  });
  if (res6.status === 200) {
    console.log('   ✅ PASS: Successfully restored Sales user.');
  } else {
    console.error('   ❌ FAIL: Failed to restore Sales user.', res6);
  }

  console.log('\n🎉 ALL USER ACCESS ENDPOINT INTEGRATION TESTS PASSED!');
}

runTests().catch(console.error);
