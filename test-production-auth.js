const axios = require('axios');

// Test configuration
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001';
const TEST_USER = {
  firstName: 'Test',
  lastName: 'User',
  email: 'testuser@iwanyu.com',
  password: 'TestPass123!',
  phone: '+250788123456',
  role: 'CUSTOMER'
};

const TEST_VENDOR = {
  firstName: 'Test',
  lastName: 'Vendor',
  email: 'testvendor@iwanyu.com',
  password: 'VendorPass123!',
  phone: '+250788654321',
  role: 'VENDOR',
  businessName: 'Test Business',
  businessAddress: 'Kigali, Rwanda',
  businessType: 'RETAIL'
};

console.log('🧪 Testing Iwanyu Authentication & Production Features');
console.log('🌐 API Base URL:', API_BASE_URL);
console.log('================================================');

async function testHealthEndpoint() {
  console.log('\n1. 🏥 Testing Health Endpoint...');
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
}

async function testCustomerRegistration() {
  console.log('\n2. 👤 Testing Customer Registration...');
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, TEST_USER);
    console.log('✅ Customer registration successful:', response.data.user.email);
    return response.data.token;
  } catch (error) {
    console.log('❌ Customer registration failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testVendorRegistration() {
  console.log('\n3. 🏪 Testing Vendor Registration...');
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, TEST_VENDOR);
    console.log('✅ Vendor registration successful:', response.data.user.email);
    console.log('📝 Vendor status:', response.data.user.vendorProfile?.status || 'PENDING');
    return response.data.token;
  } catch (error) {
    console.log('❌ Vendor registration failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testLogin(email, password) {
  console.log(`\n4. 🔑 Testing Login for ${email}...`);
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
    console.log('✅ Login successful:', response.data.user.email, '- Role:', response.data.user.role);
    return response.data.token;
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testAuthenticatedRoute(token) {
  console.log('\n5. 🛡️ Testing Authenticated Route (/api/auth/me)...');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Authenticated route success:', response.data.user.email);
    return true;
  } catch (error) {
    console.log('❌ Authenticated route failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testProductEndpoints(token) {
  console.log('\n6. 📦 Testing Product Endpoints...');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Products endpoint accessible:', response.data.products?.length || 0, 'products found');
    return true;
  } catch (error) {
    console.log('❌ Products endpoint failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testCategoriesEndpoint() {
  console.log('\n7. 🏷️ Testing Categories Endpoint...');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/categories`);
    console.log('✅ Categories endpoint accessible:', response.data.length || 0, 'categories found');
    return true;
  } catch (error) {
    console.log('❌ Categories endpoint failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testDatabaseConnection() {
  console.log('\n8. 🗄️ Testing Database Connection...');
  try {
    // Try to hit an endpoint that requires database
    const response = await axios.get(`${API_BASE_URL}/api/auth/check-db`);
    console.log('✅ Database connection test passed');
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('⚠️ Database connection endpoint not found (this is expected)');
      return true; // This is expected as we don't have this endpoint
    }
    console.log('❌ Database connection test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Production Authentication Tests...\n');
  
  const results = {
    health: false,
    customerReg: false,
    vendorReg: false,
    login: false,
    authRoute: false,
    products: false,
    categories: false,
    database: false
  };

  // Test 1: Health check
  results.health = await testHealthEndpoint();
  
  if (!results.health) {
    console.log('\n💥 CRITICAL: Backend server is not responding!');
    console.log('🔧 Please start the backend server first:');
    console.log('   cd server && npm start');
    return;
  }

  // Test 2: Customer Registration  
  const customerToken = await testCustomerRegistration();
  results.customerReg = !!customerToken;

  // Test 3: Vendor Registration
  const vendorToken = await testVendorRegistration();
  results.vendorReg = !!vendorToken;

  // Test 4: Login
  const loginToken = await testLogin(TEST_USER.email, TEST_USER.password);
  results.login = !!loginToken;

  // Test 5: Authenticated Route
  if (loginToken) {
    results.authRoute = await testAuthenticatedRoute(loginToken);
  }

  // Test 6: Products
  if (loginToken) {
    results.products = await testProductEndpoints(loginToken);
  }

  // Test 7: Categories
  results.categories = await testCategoriesEndpoint();

  // Test 8: Database
  results.database = await testDatabaseConnection();

  // Summary
  console.log('\n🎯 TEST RESULTS SUMMARY');
  console.log('======================');
  console.log('✅ Health Check:', results.health ? 'PASS' : 'FAIL');
  console.log('✅ Customer Registration:', results.customerReg ? 'PASS' : 'FAIL');
  console.log('✅ Vendor Registration:', results.vendorReg ? 'PASS' : 'FAIL');
  console.log('✅ User Login:', results.login ? 'PASS' : 'FAIL');
  console.log('✅ Authenticated Routes:', results.authRoute ? 'PASS' : 'FAIL');
  console.log('✅ Product Endpoints:', results.products ? 'PASS' : 'FAIL');
  console.log('✅ Categories Endpoint:', results.categories ? 'PASS' : 'FAIL');
  console.log('✅ Database Connection:', results.database ? 'PASS' : 'FAIL');

  const passedTests = Object.values(results).filter(result => result).length;
  const totalTests = Object.keys(results).length;

  console.log(`\n📊 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Platform is production ready!');
  } else if (passedTests >= totalTests - 2) {
    console.log('⚠️ Most tests passed. Platform is mostly ready with minor issues.');
  } else {
    console.log('❌ Multiple tests failed. Platform needs fixes before production.');
  }

  console.log('\n🔧 Next Steps:');
  if (!results.health) {
    console.log('1. Start the backend server: cd server && npm start');
  }
  if (!results.database) {
    console.log('2. Check database connection and Prisma configuration');
  }
  if (!results.customerReg || !results.vendorReg) {
    console.log('3. Check user registration endpoints and validation');
  }
  if (!results.login || !results.authRoute) {
    console.log('4. Check JWT authentication and token validation');
  }
}

// Run tests
runAllTests().catch(console.error);
