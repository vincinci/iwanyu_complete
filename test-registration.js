// Test registration endpoint directly
const axios = require('axios');

async function testRegistration() {
  const testUser = {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    phone: "+250123456789",
    password: "password123",
    role: "CUSTOMER"
  };

  try {
    console.log('Testing registration endpoint...');
    const response = await axios.post('http://localhost:3001/api/auth/register', testUser);
    console.log('✅ Registration successful:', response.data);
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start the backend server first.');
      console.log('Run: cd server && npm run dev');
    } else {
      console.log('❌ Registration failed:', error.response?.data || error.message);
    }
  }
}

testRegistration();
