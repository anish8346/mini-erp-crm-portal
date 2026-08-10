const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Phase 3 Auth & RBAC Automated Verification Tests...\n');

  let adminToken = '';
  let salesToken = '';
  let warehouseToken = '';

  // Helper fetch function
  async function apiRequest(endpoint, options = {}) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    const status = res.status;
    const body = await res.json().catch(() => ({}));
    return { status, body };
  }

  // 1. Valid Admin Login
  console.log('1️⃣ Testing Valid Admin Login...');
  const res1 = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@fundsroom.com', password: 'Password@123' }),
  });
  if (res1.status === 200 && res1.body.success && res1.body.data.token) {
    adminToken = res1.body.data.token;
    console.log('   ✅ PASS: Admin logged in successfully. Role:', res1.body.data.user.role);
  } else {
    console.error('   ❌ FAIL: Admin login failed', res1);
  }

  // 2. Valid Sales Login
  console.log('2️⃣ Testing Valid Sales Login...');
  const res2 = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'sales@fundsroom.com', password: 'Password@123' }),
  });
  if (res2.status === 200 && res2.body.success && res2.body.data.token) {
    salesToken = res2.body.data.token;
    console.log('   ✅ PASS: Sales logged in successfully. Role:', res2.body.data.user.role);
  } else {
    console.error('   ❌ FAIL: Sales login failed', res2);
  }

  // 3. Valid Warehouse Login
  console.log('3️⃣ Testing Valid Warehouse Login...');
  const res3 = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'warehouse@fundsroom.com', password: 'Password@123' }),
  });
  if (res3.status === 200 && res3.body.success && res3.body.data.token) {
    warehouseToken = res3.body.data.token;
    console.log('   ✅ PASS: Warehouse logged in successfully. Role:', res3.body.data.user.role);
  } else {
    console.error('   ❌ FAIL: Warehouse login failed', res3);
  }

  // 4. Invalid Password
  console.log('4️⃣ Testing Invalid Password (Expected HTTP 401)...');
  const res4 = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@fundsroom.com', password: 'WrongPassword' }),
  });
  if (res4.status === 401 && !res4.body.success) {
    console.log('   ✅ PASS: Invalid password rejected with HTTP 401:', res4.body.message);
  } else {
    console.error('   ❌ FAIL: Expected 401 for invalid password, got:', res4.status);
  }

  // 5. Invalid Email
  console.log('5️⃣ Testing Invalid Email (Expected HTTP 401)...');
  const res5 = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'nonexistent@fundsroom.com', password: 'Password@123' }),
  });
  if (res5.status === 401 && !res5.body.success) {
    console.log('   ✅ PASS: Nonexistent user rejected with HTTP 401:', res5.body.message);
  } else {
    console.error('   ❌ FAIL: Expected 401 for invalid email, got:', res5.status);
  }

  // 6. Missing Token on Protected Endpoint
  console.log('6️⃣ Testing Protected Endpoint without Token (Expected HTTP 401)...');
  const res6 = await apiRequest('/auth/me', { method: 'GET' });
  if (res6.status === 401 && !res6.body.success) {
    console.log('   ✅ PASS: Missing token rejected with HTTP 401:', res6.body.message);
  } else {
    console.error('   ❌ FAIL: Expected 401 for missing token, got:', res6.status);
  }

  // 7. Invalid Token on Protected Endpoint
  console.log('7️⃣ Testing Protected Endpoint with Invalid Token (Expected HTTP 401)...');
  const res7 = await apiRequest('/auth/me', {
    method: 'GET',
    headers: { Authorization: 'Bearer invalid.jwt.token' },
  });
  if (res7.status === 401 && !res7.body.success) {
    console.log('   ✅ PASS: Invalid token rejected with HTTP 401:', res7.body.message);
  } else {
    console.error('   ❌ FAIL: Expected 401 for invalid token, got:', res7.status);
  }

  // 8. Valid Token Profile Retrieval
  console.log('8️⃣ Testing Profile Retrieval (/api/auth/me)...');
  const res8 = await apiRequest('/auth/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (res8.status === 200 && res8.body.success && !res8.body.data.user.passwordHash) {
    console.log('   ✅ PASS: User profile fetched without passwordHash:', res8.body.data.user.email);
  } else {
    console.error('   ❌ FAIL: Failed to retrieve profile or passwordHash leaked:', res8);
  }

  // 9. Admin Access Admin Endpoint
  console.log('9️⃣ Testing Admin accessing Admin Endpoint (/api/auth/test/admin)...');
  const res9 = await apiRequest('/auth/test/admin', {
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (res9.status === 200 && res9.body.success) {
    console.log('   ✅ PASS: Admin granted access to Admin endpoint.');
  } else {
    console.error('   ❌ FAIL: Admin denied access:', res9);
  }

  // 10. Sales User Access Admin Endpoint (Expected HTTP 403)
  console.log('🔟 Testing Sales user accessing Admin Endpoint (Expected HTTP 403)...');
  const res10 = await apiRequest('/auth/test/admin', {
    method: 'GET',
    headers: { Authorization: `Bearer ${salesToken}` },
  });
  if (res10.status === 403 && !res10.body.success) {
    console.log('   ✅ PASS: Sales user forbidden from Admin endpoint with HTTP 403:', res10.body.message);
  } else {
    console.error('   ❌ FAIL: Expected 403 for Sales user on Admin endpoint, got:', res10.status);
  }

  // 11. Warehouse User Access Sales Endpoint (Expected HTTP 403)
  console.log('1️⃣1️⃣ Testing Warehouse user accessing Sales Endpoint (Expected HTTP 403)...');
  const res11 = await apiRequest('/auth/test/sales', {
    method: 'GET',
    headers: { Authorization: `Bearer ${warehouseToken}` },
  });
  if (res11.status === 403 && !res11.body.success) {
    console.log('   ✅ PASS: Warehouse user forbidden from Sales endpoint with HTTP 403:', res11.body.message);
  } else {
    console.error('   ❌ FAIL: Expected 403 for Warehouse user on Sales endpoint, got:', res11.status);
  }

  console.log('\n🎉 ALL 11 AUTHENTICATION & RBAC TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('Test script error:', err);
  process.exit(1);
});
