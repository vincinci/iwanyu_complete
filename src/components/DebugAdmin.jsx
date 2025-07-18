import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const DebugAdmin = () => {
  const [loading, setLoading] = useState(false);

  const createAdmin = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/create-admin');
      toast.success(response.data.message);
      console.log('Admin created:', response.data.user);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create admin';
      toast.error(message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Debug Admin Creation</h1>
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Click the button below to create an admin user for testing purposes.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800">Admin Credentials:</h3>
            <p className="text-sm text-yellow-700 mt-1">
              <strong>Email:</strong> admin@iwanyu.com<br />
              <strong>Password:</strong> admin123
            </p>
          </div>
          <button
            onClick={createAdmin}
            disabled={loading}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? 'Creating Admin...' : 'Create Admin User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugAdmin;
