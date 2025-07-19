import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const DemoLogin = () => {
  const navigate = useNavigate();
  const { login, isApiConnected, demoUsers } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleDemoLogin = async (role) => {
    setLoading(true);
    const demoUser = demoUsers[role];
    
    try {
      const result = await login(demoUser.email, 'demo123');
      if (result.success) {
        toast.success(`Welcome, ${demoUser.name}!`);
        
        // Redirect based on role
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'vendor') {
          navigate('/vendor');
        } else {
          navigate('/');
        }
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFormLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(credentials.email, credentials.password);
      if (result.success) {
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to Iwanyu
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {!isApiConnected && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium mr-2">
                <Sparkles className="w-3 h-3 mr-1" />
                Demo Mode
              </span>
            )}
            Sign in to your account or try a demo
          </p>
        </div>

        {/* Demo Login Options */}
        {!isApiConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Demo Access</h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
                className="btn btn-primary w-full"
              >
                <User className="w-4 h-4 mr-2" />
                Login as Admin
              </button>
              <button
                onClick={() => handleDemoLogin('vendor')}
                disabled={loading}
                className="btn btn-secondary w-full"
              >
                <User className="w-4 h-4 mr-2" />
                Login as Vendor
              </button>
              <button
                onClick={() => handleDemoLogin('customer')}
                disabled={loading}
                className="btn btn-secondary w-full"
              >
                <User className="w-4 h-4 mr-2" />
                Login as Customer
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              No registration required • Instant access • All features unlocked
            </p>
          </motion.div>
        )}

        {/* Regular Login Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          onSubmit={handleFormLogin}
        >
          <h3 className="text-lg font-medium text-gray-900">
            {isApiConnected ? 'Account Login' : 'Manual Demo Login'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field"
                placeholder="Email address"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="input-field pr-10"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {!isApiConnected && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-700">
                <strong>Demo accounts:</strong><br />
                • admin@iwanyu.com / demo123<br />
                • vendor@iwanyu.com / demo123<br />
                • user@iwanyu.com / demo123
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              <span className="flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                Sign in
              </span>
            )}
          </button>

          <div className="text-center">
            <Link
              to="/register"
              className="text-sm text-orange-600 hover:text-orange-500"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default DemoLogin;
