import axios from 'axios';

// Get API URL with fallback
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const defaultUrl = 'http://localhost:3001';
  
  // In production, provide a warning if API URL is not set
  if (import.meta.env.PROD && (!envUrl || envUrl.includes('localhost'))) {
    console.error('❌ API URL not properly configured for production. Please set VITE_API_URL environment variable.');
    throw new Error('API URL not configured for production');
  }
  
  return envUrl || defaultUrl;
};

// Create axios instance
const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Handle server errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;
      
      // Authentication errors
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API Service Functions
export const productAPI = {
  getAll: (params = {}) => api.get('/api/products', { params }),
  getById: (id) => api.get(`/api/products/${id}`),
  create: (data) => api.post('/api/products', data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`),
  getByVendor: (vendorId, params = {}) => api.get(`/api/products/vendor/${vendorId}`, { params }),
};

export const vendorAPI = {
  getAll: (params = {}) => api.get('/api/vendors', { params }),
  getById: (id) => api.get(`/api/vendors/${id}`),
  getDashboard: () => api.get('/api/vendors/dashboard'),
  getProducts: (params = {}) => api.get('/api/vendors/products', { params }),
  getOrders: (params = {}) => api.get('/api/vendors/orders', { params }),
  getAnalytics: (params = {}) => api.get('/api/vendors/analytics/dashboard', { params }),
  updateProfile: (data) => api.put('/api/vendors/profile', data),
  uploadDocuments: (data) => api.post('/api/vendors/documents', data),
};

export const adminAPI = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getUsers: (params = {}) => api.get('/api/admin/users', { params }),
  updateUser: (id, data) => api.put(`/api/admin/users/${id}`, data),
  getVendors: (params = {}) => api.get('/api/admin/vendors', { params }),
  updateVendor: (id, data) => api.put(`/api/admin/vendors/${id}/status`, data),
  approveVendor: (id) => api.put(`/api/admin/vendors/${id}/status`, { status: 'APPROVED' }),
  rejectVendor: (id, reason) => api.put(`/api/admin/vendors/${id}/status`, { status: 'REJECTED', rejectionReason: reason }),
  getProducts: (params = {}) => api.get('/api/admin/products', { params }),
  updateProduct: (id, data) => api.put(`/api/admin/products/${id}`, data),
  getOrders: (params = {}) => api.get('/api/admin/orders', { params }),
  getAnalytics: (params = {}) => api.get('/api/admin/analytics', { params }),
};

export const orderAPI = {
  getAll: (params = {}) => api.get('/api/orders', { params }),
  getById: (id) => api.get(`/api/orders/${id}`),
  create: (data) => api.post('/api/orders', data),
  update: (id, data) => api.put(`/api/orders/${id}`, data),
  updateStatus: (id, status) => api.put(`/api/orders/${id}/status`, { status }),
};

export const categoryAPI = {
  getAll: () => api.get('/api/categories'),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`),
};

export const cartAPI = {
  get: () => api.get('/api/cart'),
  add: (productId, quantity = 1) => api.post('/api/cart', { productId, quantity }),
  update: (itemId, quantity) => api.put(`/api/cart/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/api/cart/${itemId}`),
  clear: () => api.delete('/api/cart'),
};

export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  logout: () => api.post('/api/auth/logout'),
  checkAuth: () => api.get('/api/auth/me'),
  refreshToken: () => api.post('/api/auth/refresh'),
};

export default api;
