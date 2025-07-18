// Test the server registration endpoint
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testRegistration() {
  try {
    console.log('🧪 Testing registration endpoint...');
    
    // Test customer registration first
    const customerData = {
      firstName: 'Test',
      lastName: 'Customer',
      email: `customer${Date.now()}@test.com`,
      phone: '+250123456789',
      password: 'password123',
      role: 'CUSTOMER'
    };

    console.log('📝 Testing customer registration...');
    const customerResponse = await axios.post(
      'http://localhost:3001/api/auth/register',
      customerData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5174'
        }
      }
    );
    
    console.log('✅ Customer registration successful:', customerResponse.data.message);

    // Test vendor registration with form data
    const vendorFormData = new FormData();
    vendorFormData.append('firstName', 'Test');
    vendorFormData.append('lastName', 'Vendor');
    vendorFormData.append('email', `vendor${Date.now()}@test.com`);
    vendorFormData.append('phone', '+250123456789');
    vendorFormData.append('password', 'password123');
    vendorFormData.append('role', 'VENDOR');
    vendorFormData.append('businessName', 'Test Business');
    vendorFormData.append('businessAddress', '123 Test Street, Kigali, Rwanda');

    // Create a dummy file for testing
    const dummyFile = Buffer.from('This is a test document');
    vendorFormData.append('idDocument', dummyFile, {
      filename: 'test-id.pdf',
      contentType: 'application/pdf'
    });

    console.log('📝 Testing vendor registration...');
    const vendorResponse = await axios.post(
      'http://localhost:3001/api/auth/register',
      vendorFormData,
      {
        headers: {
          ...vendorFormData.getHeaders(),
          'Origin': 'http://localhost:5174'
        }
      }
    );
    
    console.log('✅ Vendor registration successful:', vendorResponse.data.message);
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start the backend server first.');
      console.log('📋 To start the server:');
      console.log('   cd server');
      console.log('   npm run dev');
    } else {
      console.log('❌ Test failed:', error.response?.data?.message || error.message);
      if (error.response?.data) {
        console.log('📄 Full error response:', error.response.data);
      }
    }
  }
}

testRegistration();
