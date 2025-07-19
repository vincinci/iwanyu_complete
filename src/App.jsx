import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ChatProvider } from './contexts/ChatContext';
import { ApiProvider } from './contexts/ApiContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/user/Profile';
import Orders from './pages/user/Orders';
import Wishlist from './pages/user/Wishlist';
import Chat from './components/chat/Chat';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { useAuth } from './contexts/AuthContext';

// Lazy load heavy components to improve performance
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const VendorDashboard = React.lazy(() => import('./pages/vendor/Dashboard'));
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));

function App() {
  return (
    <ApiProvider>
      <AuthProvider>
        <CartProvider>
        <ChatProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:slug" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <ProductDetail />
                    </Suspense>
                  } />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Protected Routes */}
                  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                  <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                  
                  {/* Vendor Routes */}
                  <Route path="/vendor/*" element={
                    <VendorRoute>
                      <Suspense fallback={<LoadingSpinner />}>
                        <VendorDashboard />
                      </Suspense>
                    </VendorRoute>
                  } />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/*" element={
                    <AdminRoute>
                      <Suspense fallback={<LoadingSpinner />}>
                        <AdminDashboard />
                      </Suspense>
                    </AdminRoute>
                  } />
                </Routes>
              </main>
              <Footer />
              <Chat />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '16px',
                    color: '#1f2937',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  },
                  success: {
                    style: {
                      background: 'rgba(34, 197, 94, 0.9)',
                      color: '#fff',
                    },
                  },
                  error: {
                    style: {
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: '#fff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </ChatProvider>
      </CartProvider>
    </AuthProvider>
    </ApiProvider>
  );
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Vendor Route Component
const VendorRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!user || user.role !== 'VENDOR') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default App;
