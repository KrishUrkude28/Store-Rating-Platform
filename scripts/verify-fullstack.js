// End-to-end fullstack verification script
const http = require('http');
const fs = require('fs');
const path = require('path');

async function testFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runVerification() {
  console.log('--- STARTING FULL-STACK VERIFICATION ---');

  // 1. Verify Frontend Build Assets
  console.log('\n1. Checking Frontend Build Assets...');
  const distPath = path.join(__dirname, '../client/dist');
  const indexHtml = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexHtml)) {
    throw new Error('Frontend build index.html does not exist!');
  }
  const htmlContent = fs.readFileSync(indexHtml, 'utf8');
  if (!htmlContent.includes('Store Rating Management System')) {
    throw new Error('index.html missing expected title/content!');
  }
  console.log('✓ Frontend index.html and assets verified.');

  // 2. Verify SPA Serving
  console.log('\n2. Checking SPA Serving on Server (http://localhost:5000)...');
  const spaRes = await testFetch('http://localhost:5000/');
  if (spaRes.status !== 200 || !spaRes.body.includes('<div id="root">')) {
    throw new Error(`SPA serving failed with status ${spaRes.status}`);
  }
  console.log('✓ SPA served with status 200 and root container.');

  // 3. Test API Health
  console.log('\n3. Checking Backend API Health...');
  const healthRes = await testFetch('http://localhost:5000/api/health');
  if (healthRes.status !== 200 || healthRes.body.status !== 'healthy') {
    throw new Error('Health check failed!');
  }
  console.log('✓ API health endpoint healthy.');

  // 4. Test Unified Login - Admin
  console.log('\n4. Testing Unified Login - Administrator...');
  const adminLoginRes = await testFetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email: 'admin@storerating.com', password: 'Admin@123456' }
  });
  if (adminLoginRes.status !== 200 || adminLoginRes.body.user.role !== 'ADMIN') {
    throw new Error('Admin login failed!');
  }
  const adminToken = adminLoginRes.body.token;
  console.log(`✓ Admin authenticated. Token received.`);

  // 5. Verify Admin Stats Dashboard
  console.log('\n5. Testing Admin Dashboard Metrics...');
  const statsRes = await testFetch('http://localhost:5000/api/admin/dashboard', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  if (statsRes.status !== 200 || statsRes.body.totalUsers === undefined) {
    throw new Error('Admin stats failed!');
  }
  console.log(`✓ Admin Stats: Users=${statsRes.body.totalUsers}, Stores=${statsRes.body.totalStores}, Ratings=${statsRes.body.totalRatings}`);

  // 6. Test Unified Login - Normal User & Store Rating flow
  console.log('\n6. Testing Normal User Experience & Rating Flow...');
  const userLoginRes = await testFetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email: 'chris.evans@example.com', password: 'User@123456' }
  });
  if (userLoginRes.status !== 200 || userLoginRes.body.user.role !== 'USER') {
    throw new Error('Normal user login failed!');
  }
  const userToken = userLoginRes.body.token;
  console.log(`✓ Normal User authenticated.`);

  // Get user stores
  const storesRes = await testFetch('http://localhost:5000/api/stores', {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  if (storesRes.status !== 200 || !storesRes.body.stores || storesRes.body.stores.length === 0) {
    throw new Error('Failed to retrieve stores for user!');
  }
  const firstStore = storesRes.body.stores[0];
  console.log(`✓ Retrieved ${storesRes.body.stores.length} stores. First store: "${firstStore.name}".`);

  // Submit or modify rating
  console.log(`  Submitting 5-star rating for store ${firstStore.id}...`);
  const rateRes = await testFetch('http://localhost:5000/api/ratings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: { store_id: firstStore.id, rating: 5 }
  });
  if (rateRes.status !== 200 && rateRes.status !== 201) {
    throw new Error(`Rating submission failed with status ${rateRes.status}: ${JSON.stringify(rateRes.body)}`);
  }
  console.log(`✓ Rating 5 stars successfully recorded for store ${firstStore.id}.`);

  // 7. Test Store Owner Dashboard
  console.log('\n7. Testing Store Owner Dashboard & Analytics...');
  const ownerLoginRes = await testFetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email: 'alex.owner@freshmart.com', password: 'Owner@123456' }
  });
  if (ownerLoginRes.status !== 200 || ownerLoginRes.body.user.role !== 'STORE_OWNER') {
    throw new Error('Store owner login failed!');
  }
  const ownerToken = ownerLoginRes.body.token;
  console.log(`✓ Store owner authenticated.`);

  const ownerDashRes = await testFetch('http://localhost:5000/api/owner/dashboard', {
    headers: { 'Authorization': `Bearer ${ownerToken}` }
  });
  if (ownerDashRes.status !== 200 || (!ownerDashRes.body.stores && !ownerDashRes.body.store)) {
    console.error('ownerDashRes details:', ownerDashRes.status, ownerDashRes.body);
    throw new Error('Store owner dashboard retrieval failed!');
  }
  const ownerStore = ownerDashRes.body.store || (ownerDashRes.body.stores && ownerDashRes.body.stores[0]);
  const raters = ownerDashRes.body.raters || ownerStore.ratings || [];
  console.log(`✓ Store Owner Dashboard: Store="${ownerStore.name}", Avg Rating=${ownerStore.averageRating || ownerStore.average_rating}, Total Ratings=${ownerStore.totalRatings || ownerStore.total_ratings}`);
  console.log(`✓ Customer Reviews Count in Breakdown: ${raters.length}`);

  // 8. Test Role Authorization Protection
  console.log('\n8. Testing Role-Based Route Isolation (Security Verification)...');
  const unauthorizedAdminAccess = await testFetch('http://localhost:5000/api/admin/dashboard', {
    headers: { 'Authorization': `Bearer ${userToken}` } // Normal user trying to access admin dashboard
  });
  if (unauthorizedAdminAccess.status !== 403) {
    throw new Error(`Expected 403 Forbidden for normal user accessing admin dashboard, got ${unauthorizedAdminAccess.status}`);
  }
  console.log('✓ Normal user blocked from admin dashboard (403 Forbidden).');

  const unauthorizedOwnerAccess = await testFetch('http://localhost:5000/api/owner/dashboard', {
    headers: { 'Authorization': `Bearer ${userToken}` } // Normal user trying to access owner dashboard
  });
  if (unauthorizedOwnerAccess.status !== 403) {
    throw new Error(`Expected 403 Forbidden for normal user accessing owner dashboard, got ${unauthorizedOwnerAccess.status}`);
  }
  console.log('✓ Normal user blocked from store owner dashboard (403 Forbidden).');

  console.log('\n======================================================');
  console.log('ALL FULLSTACK INTEGRATION & E2E TESTS PASSED 100%!');
  console.log('======================================================');
}

runVerification().catch((err) => {
  console.error('\nVerification FAILED:', err);
  process.exit(1);
});
