import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  logout: () => api.post('/api/auth/logout'),
  checkAuth: () => api.get('/api/auth/me'),
  refreshToken: () => api.post('/api/auth/refresh'),
};

export const productAPI = {
  getAll: (params = {}) => api.get('/api/products', { params }),
  getById: (id) => api.get('/api/products/' + id),
  create: (data) => api.post('/api/products', data),
  update: (id, data) => api.put('/api/products/' + id, data),
  delete: (id) => api.delete('/api/products/' + id),
};

export const adminAPI = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getUsers: (params = {}) => api.get('/api/admin/users', { params }),
  getVendors: (params = {}) => api.get('/api/admin/vendors', { params }),
  getProducts: (params = {}) => api.get('/api/admin/products', { params }),
  getOrders: (params = {}) => api.get('/api/admin/orders', { params }),
};

export const vendorAPI = {
  getDashboard: () => api.get('/api/vendors/dashboard'),
  getProducts: (params = {}) => api.get('/api/vendors/products', { params }),
  getOrders: (params = {}) => api.get('/api/vendors/orders', { params }),
};

export const orderAPI = {
  getAll: (params = {}) => api.get('/api/orders', { params }),
  getById: (id) => api.get('/api/orders/' + id),
  create: (data) => api.post('/api/orders', data),
};

export const cartAPI = {
  get: () => api.get('/api/cart'),
  add: (productId, quantity = 1) => api.post('/api/cart', { productId, quantity }),
  update: (itemId, quantity) => api.put('/api/cart/' + itemId, { quantity }),
  remove: (itemId) => api.delete('/api/cart/' + itemId),
  clear: () => api.delete('/api/cart'),
};

export const categoryAPI = {
  getAll: () => api.get('/api/categories'),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put('/api/categories/' + id, data),
  delete: (id) => api.delete('/api/categories/' + id),
};

export default api;
