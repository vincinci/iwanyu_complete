// Simple test to check if server can be reached
const axios = require('axios');

async function testServer() {
  try {
    console.log('Testing server connection...');
    const response = await axios.get('http://localhost:3001/health');
    console.log('✅ Server is running:', response.data);
  } catch (error) {
    console.log('❌ Server is not running:', error.message);
    console.log('Starting server...');
    
    // Try to start the server
    const { spawn } = require('child_process');
    const serverProcess = spawn('npm', ['start'], { 
      cwd: './server',
      stdio: 'inherit'
    });
    
    console.log('Server started with PID:', serverProcess.pid);
  }
}

testServer();
