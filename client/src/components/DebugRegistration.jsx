import React, { useState } from 'react';
import api from '../services/api';

const DebugRegistration = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    try {
      setLoading(true);
      const response = await api.get('/health');
      setResult({ type: 'success', message: 'Server connection successful', data: response.data });
    } catch (error) {
      setResult({ 
        type: 'error', 
        message: 'Server connection failed', 
        error: error.message,
        code: error.code 
      });
    } finally {
      setLoading(false);
    }
  };

  const testRegistration = async () => {
    try {
      setLoading(true);
      const testData = {
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@example.com`,
        phone: '+250123456789',
        password: 'password123',
        role: 'CUSTOMER'
      };
      
      const response = await api.post('/api/auth/register', testData);
      setResult({ type: 'success', message: 'Registration successful', data: response.data });
    } catch (error) {
      setResult({ 
        type: 'error', 
        message: 'Registration failed', 
        error: error.response?.data || error.message,
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Registration</h1>
      
      <div className="space-y-4">
        <button 
          onClick={testConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Test Server Connection
        </button>
        
        <button 
          onClick={testRegistration}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          Test Registration
        </button>
      </div>
      
      {loading && <div className="mt-4 text-blue-600">Loading...</div>}
      
      {result && (
        <div className={`mt-4 p-4 rounded ${result.type === 'error' ? 'bg-red-100' : 'bg-green-100'}`}>
          <h3 className="font-bold">{result.message}</h3>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugRegistration;
