const BASE_URL = 'http://localhost:5000/api';

async function testDashboardMetrics() {
  console.log('🧪 Testing Phase 10 Live Dashboard Metrics Backend API...\n');

  // Authenticate Admin
  const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@fundsroom.com', password: 'Password@123' }),
  });
  const adminBody = await adminLogin.json();
  const token = adminBody.data.token;

  // Fetch Dashboard Metrics
  const metricsRes = await fetch(`${BASE_URL}/dashboard/metrics`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const resBody = await metricsRes.json();

  if (metricsRes.status === 200 && resBody.success && resBody.data.kpis) {
    const kpis = resBody.data.kpis;
    console.log('✅ PASS: Dashboard metrics retrieved successfully from database:');
    console.log('   - Total Customers:', kpis.totalCustomers);
    console.log('   - Total Products:', kpis.totalProducts);
    console.log('   - Low Stock Count:', kpis.lowStockCount);
    console.log('   - Total Challans:', kpis.totalChallans);
    console.log('   - Today\'s Challans:', kpis.todaysChallans);
    console.log('   - Recent Challans Count:', resBody.data.recentChallans.length);
    console.log('   - Low Stock Products Count:', resBody.data.lowStockProducts.length);
    console.log('   - Recent Stock Movements Count:', resBody.data.recentStockMovements.length);
    console.log('\n🎉 PHASE 10 DASHBOARD BACKEND API VERIFIED SUCCESSFULLY!');
  } else {
    console.error('❌ FAIL: Dashboard metrics API failed:', resBody);
    process.exit(1);
  }
}

testDashboardMetrics();
