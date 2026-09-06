const http = require('http');
const app = require('../server');

let server;
let baseUrl;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = data ? JSON.parse(data) : {};
        } catch (e) {
          json = { raw: data };
        }
        resolve({ status: res.statusCode, body: json });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log('--- STARTING STORE RATING SYSTEM API TESTS ---\n');

  // Seed database for deterministic test run
  const seedDatabase = require('./seed');
  await seedDatabase();

  // Start HTTP server on random port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`Test server running at ${baseUrl}\n`);
      resolve();
    });
  });

  let adminToken = '';
  let ownerToken = '';
  let userToken = '';
  let user2Token = '';
  let testStoreId = null;
  let testRatingId = null;

  try {
    // 1. Unified Login (AUTH-001)
    console.log('1. Testing Unified Login (AUTH-001)...');
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@storerating.com',
      password: 'Admin@123456'
    });
    assert(adminLogin.status === 200, 'Admin login failed');
    assert(adminLogin.body.user.role === 'ADMIN', 'Admin role should be ADMIN');
    adminToken = adminLogin.body.token;

    const ownerLogin = await request('POST', '/api/auth/login', {
      email: 'alex.owner@freshmart.com',
      password: 'Owner@123456'
    });
    assert(ownerLogin.status === 200, 'Owner login failed');
    assert(ownerLogin.body.user.role === 'STORE_OWNER', 'Owner role should be STORE_OWNER');
    ownerToken = ownerLogin.body.token;

    const userLogin = await request('POST', '/api/auth/login', {
      email: 'chris.evans@example.com',
      password: 'User@123456'
    });
    assert(userLogin.status === 200, 'User login failed');
    assert(userLogin.body.user.role === 'USER', 'User role should be USER');
    userToken = userLogin.body.token;

    const invalidLogin = await request('POST', '/api/auth/login', {
      email: 'admin@storerating.com',
      password: 'WrongPassword@123'
    });
    assert(invalidLogin.status === 401, 'Invalid login should return 401');
    console.log('   ✓ Unified Login passed for all roles & rejected bad credentials');

    // 2. Validation Test Matrix (PRD Section 71)
    console.log('2. Testing Registration & Validation Test Matrix (Section 71)...');
    
    // Name < 20 chars
    const shortName = await request('POST', '/api/auth/register', {
      name: 'Short Name',
      email: 'valid1@example.com',
      password: 'Password@123',
      address: 'Valid address description'
    });
    assert(shortName.status === 400 && shortName.body.errors.name, 'Name < 20 characters must be rejected');

    // Name > 60 chars
    const longName = await request('POST', '/api/auth/register', {
      name: 'A'.repeat(61),
      email: 'valid2@example.com',
      password: 'Password@123',
      address: 'Valid address description'
    });
    assert(longName.status === 400 && longName.body.errors.name, 'Name > 60 characters must be rejected');

    // Address > 400 chars
    const longAddress = await request('POST', '/api/auth/register', {
      name: 'Valid Name Exactly Twenty Two',
      email: 'valid3@example.com',
      password: 'Password@123',
      address: 'A'.repeat(401)
    });
    assert(longAddress.status === 400 && longAddress.body.errors.address, 'Address > 400 characters must be rejected');

    // Password < 8 chars
    const shortPass = await request('POST', '/api/auth/register', {
      name: 'Valid Name Exactly Twenty Two',
      email: 'valid4@example.com',
      password: 'Pass@1',
      address: 'Valid address description'
    });
    assert(shortPass.status === 400 && shortPass.body.errors.password, 'Password < 8 characters must be rejected');

    // Password > 16 chars
    const longPass = await request('POST', '/api/auth/register', {
      name: 'Valid Name Exactly Twenty Two',
      email: 'valid5@example.com',
      password: 'VeryLongPassword@12345678',
      address: 'Valid address description'
    });
    assert(longPass.status === 400 && longPass.body.errors.password, 'Password > 16 characters must be rejected');

    // Password no uppercase
    const noUpperPass = await request('POST', '/api/auth/register', {
      name: 'Valid Name Exactly Twenty Two',
      email: 'valid6@example.com',
      password: 'password@123',
      address: 'Valid address description'
    });
    assert(noUpperPass.status === 400 && noUpperPass.body.errors.password, 'Password without uppercase must be rejected');

    // Password no special character
    const noSpecialPass = await request('POST', '/api/auth/register', {
      name: 'Valid Name Exactly Twenty Two',
      email: 'valid7@example.com',
      password: 'Password1234',
      address: 'Valid address description'
    });
    assert(noSpecialPass.status === 400 && noSpecialPass.body.errors.password, 'Password without special character must be rejected');

    // Invalid email format
    const invalidEmail = await request('POST', '/api/auth/register', {
      name: 'Valid Name Exactly Twenty Two',
      email: 'invalid-email-format',
      password: 'Password@123',
      address: 'Valid address description'
    });
    assert(invalidEmail.status === 400 && invalidEmail.body.errors.email, 'Invalid email format must be rejected');

    // Successful registration
    const validReg = await request('POST', '/api/auth/register', {
      name: 'Brand New Test User Registration',
      email: 'testuser2@example.com',
      password: 'Secure@123',
      address: '123 Test Street, Testing City, Test State'
    });
    assert(validReg.status === 201, 'Valid user registration should succeed');
    user2Token = validReg.body.token;

    // Duplicate email
    const duplicateEmail = await request('POST', '/api/auth/register', {
      name: 'Another User With Same Email Address',
      email: 'testuser2@example.com',
      password: 'Secure@123',
      address: '456 Test Street, Testing City, Test State'
    });
    assert(duplicateEmail.status === 400, 'Duplicate email must be rejected');
    console.log('   ✓ Registration validation test matrix fully verified');

    // 3. Authorization Test Matrix (PRD Section 72)
    console.log('3. Testing Authorization Matrix (Section 72)...');
    
    // Unauthenticated -> Deny (401)
    const noAuth = await request('GET', '/api/admin/dashboard');
    assert(noAuth.status === 401, 'Unauthenticated access to /api/admin/dashboard must return 401');

    // Normal user -> Deny (403)
    const userToAdmin = await request('GET', '/api/admin/dashboard', null, userToken);
    assert(userToAdmin.status === 403, 'Normal user accessing admin dashboard must return 403');

    // Store owner -> Deny (403)
    const ownerToAdmin = await request('GET', '/api/admin/dashboard', null, ownerToken);
    assert(ownerToAdmin.status === 403, 'Store owner accessing admin dashboard must return 403');

    // Admin -> Allow (200)
    const adminToAdmin = await request('GET', '/api/admin/dashboard', null, adminToken);
    assert(adminToAdmin.status === 200, 'Admin accessing admin dashboard must return 200');
    assert(adminToAdmin.body.totalUsers >= 4, 'Total users metric must be present');
    assert(adminToAdmin.body.totalStores >= 3, 'Total stores metric must be present');
    assert(adminToAdmin.body.totalRatings >= 7, 'Total ratings metric must be present');

    // Normal User -> Create Store -> Deny (403)
    const userCreateStore = await request('POST', '/api/stores', {
      name: 'Hacked Store Name',
      email: 'hacked@store.com',
      address: '123 Fake Street',
      owner_id: 2
    }, userToken);
    assert(userCreateStore.status === 403, 'Normal user cannot create store');

    // Store Owner -> Submit Rating -> Deny (403)
    const ownerSubmitRating = await request('POST', '/api/ratings', {
      store_id: 1,
      rating: 5
    }, ownerToken);
    assert(ownerSubmitRating.status === 403, 'Store owner cannot submit rating');

    // Store Owner -> Owner Dashboard -> Allow (200)
    const ownerToOwner = await request('GET', '/api/owner/dashboard', null, ownerToken);
    assert(ownerToOwner.status === 200, 'Store owner accessing owner dashboard must return 200');
    assert(ownerToOwner.body.hasStore === true, 'Owner should have store');
    assert(ownerToOwner.body.store.averageRating !== null, 'Average rating must be calculated');
    console.log('   ✓ Authorization matrix strictly enforced in backend');

    // 4. Administrator User Management & Details (ADMIN-002, 003, 004, 005, 006)
    console.log('4. Testing Administrator User Listing, Filtering, Sorting & Details...');
    
    // Filter users
    const filteredUsers = await request('GET', '/api/users?role=STORE_OWNER', null, adminToken);
    assert(filteredUsers.status === 200, 'Filter users by role failed');
    assert(filteredUsers.body.users.every(u => u.role === 'STORE_OWNER'), 'All returned users must be STORE_OWNER');

    // Sort users
    const sortedUsers = await request('GET', '/api/users?sortBy=name&sortOrder=desc', null, adminToken);
    assert(sortedUsers.status === 200, 'Sort users failed');
    const names = sortedUsers.body.users.map(u => u.name);
    for (let i = 0; i < names.length - 1; i++) {
      assert(names[i].localeCompare(names[i + 1]) >= 0, 'Users must be descending by name');
    }

    // User details with Store Owner rating info (ADMIN-006)
    const ownerUserId = filteredUsers.body.users[0].id;
    const userDetails = await request('GET', `/api/users/${ownerUserId}`, null, adminToken);
    assert(userDetails.status === 200, 'Get user details failed');
    assert(userDetails.body.user.role === 'STORE_OWNER', 'User must be STORE_OWNER');
    assert(Array.isArray(userDetails.body.user.stores), 'Store Owner details must include stores array');
    console.log('   ✓ Admin user listing, filtering, sorting, and details working correctly');

    // 5. Store Listing & Search (USER-001, USER-002)
    console.log('5. Testing Store Listing, Filtering & Search (USER-001, USER-002)...');
    const allStores = await request('GET', '/api/stores', null, userToken);
    assert(allStores.status === 200, 'Get stores failed');
    assert(allStores.body.stores.length >= 3, 'Should return at least 3 stores');
    testStoreId = allStores.body.stores[0].id;

    // Search by address partial match (PRD Section 25)
    const searchRes = await request('GET', '/api/stores?search=Mumbai', null, userToken);
    assert(searchRes.status === 200, 'Search stores failed');
    assert(searchRes.body.stores.length > 0, 'Should find stores in Mumbai');
    assert(searchRes.body.stores[0].address.includes('Mumbai'), 'Store address should contain search term');
    console.log('   ✓ Store listing and search functional');

    // 6. Rating Test Matrix (Section 73)
    console.log('6. Testing Rating Submission, Validation, and Modification Matrix (Section 73)...');
    
    // Rating = 0 -> Reject
    const rate0 = await request('POST', '/api/ratings', { store_id: testStoreId, rating: 0 }, user2Token);
    assert(rate0.status === 400, 'Rating = 0 must be rejected');

    // Rating = 6 -> Reject
    const rate6 = await request('POST', '/api/ratings', { store_id: testStoreId, rating: 6 }, user2Token);
    assert(rate6.status === 400, 'Rating = 6 must be rejected');

    // Rating = -1 -> Reject
    const rateNeg = await request('POST', '/api/ratings', { store_id: testStoreId, rating: -1 }, user2Token);
    assert(rateNeg.status === 400, 'Rating = -1 must be rejected');

    // Rating = 4.5 -> Reject
    const rateDec = await request('POST', '/api/ratings', { store_id: testStoreId, rating: 4.5 }, user2Token);
    assert(rateDec.status === 400, 'Decimal rating must be rejected');

    // Rating = 5 -> Success
    const rate5 = await request('POST', '/api/ratings', { store_id: testStoreId, rating: 5 }, user2Token);
    assert(rate5.status === 201, 'Rating = 5 must succeed');
    testRatingId = rate5.body.rating.id;

    // Same user rates same store again -> Update existing rating without duplicate
    const rateAgain = await request('POST', '/api/ratings', { store_id: testStoreId, rating: 3 }, user2Token);
    assert(rateAgain.status === 200, 'Second rating on same store should update existing rating');
    assert(rateAgain.body.rating.id === testRatingId, 'Rating ID should remain same (updated)');
    assert(rateAgain.body.rating.rating === 3, 'Rating value should be updated to 3');

    // User modifies rating via PUT /api/ratings/:id
    const modifyRating = await request('PUT', `/api/ratings/${testRatingId}`, { rating: 4 }, user2Token);
    assert(modifyRating.status === 200, 'Modify rating via PUT should succeed');
    assert(modifyRating.body.rating.rating === 4, 'Rating should be updated to 4');

    // Another user attempts to modify someone else's rating -> 403 Forbidden
    const unauthorizedModify = await request('PUT', `/api/ratings/${testRatingId}`, { rating: 1 }, userToken);
    assert(unauthorizedModify.status === 403, 'Modifying another user rating must return 403');
    console.log('   ✓ Rating submission, modification, and isolation matrix verified');

    // 7. Password Change (AUTH-003)
    console.log('7. Testing Password Change (AUTH-003)...');
    
    // Wrong current password
    const wrongCurrent = await request('POST', '/api/auth/change-password', {
      currentPassword: 'WrongPassword@123',
      newPassword: 'BrandNewPassword@999',
      confirmPassword: 'BrandNewPassword@999'
    }, user2Token);
    assert(wrongCurrent.status === 400, 'Wrong current password must be rejected');

    // Mismatched confirm password
    const mismatchPass = await request('POST', '/api/auth/change-password', {
      currentPassword: 'Secure@123',
      newPassword: 'BrandNewPassword@999',
      confirmPassword: 'DifferentPassword@999'
    }, user2Token);
    assert(mismatchPass.status === 400, 'Password mismatch must be rejected');

    // Successful change
    const goodChange = await request('POST', '/api/auth/change-password', {
      currentPassword: 'Secure@123',
      newPassword: 'BrandNew@99',
      confirmPassword: 'BrandNew@99'
    }, user2Token);
    assert(goodChange.status === 200, 'Valid password change should succeed');

    // Login with new password
    const reLogin = await request('POST', '/api/auth/login', {
      email: 'testuser2@example.com',
      password: 'BrandNew@99'
    });
    assert(reLogin.status === 200, 'Login with updated password should succeed');
    console.log('   ✓ Password change verified successfully');

    console.log('\n=========================================');
    console.log('ALL PRD BACKEND API TESTS PASSED 100%!');
    console.log('=========================================\n');
  } finally {
    if (server) {
      server.close();
    }
  }
}

if (require.main === module) {
  runTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('\n❌ Test failure:', err.message);
      if (server) server.close();
      process.exit(1);
    });
}

module.exports = runTests;
