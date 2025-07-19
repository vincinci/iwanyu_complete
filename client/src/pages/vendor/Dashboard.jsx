import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Store, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Settings,
  Plus,
  Eye,
  Edit,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const VendorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    setStats({
      totalProducts: 24,
      totalOrders: 156,
      totalRevenue: 125000,
      pendingOrders: 8
    });
  }, []);

  const sidebarItems = [
    { icon: Store, label: 'Overview', path: '/vendor', exact: true },
    { icon: Package, label: 'Products', path: '/vendor/products' },
    { icon: ShoppingCart, label: 'Orders', path: '/vendor/orders' },
    { icon: TrendingUp, label: 'Analytics', path: '/vendor/analytics' },
    { icon: Users, label: 'Customers', path: '/vendor/customers' },
    { icon: Settings, label: 'Settings', path: '/vendor/settings' },
  ];

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "orange" }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-gray-900 mt-1`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-500`} />
        </div>
      </div>
    </motion.div>
  );

  const VendorOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}!</h1>
        <p className="text-orange-100 mt-2">Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Package}
          title="Total Products"
          value={stats.totalProducts}
          subtitle="Active listings"
        />
        <StatCard
          icon={ShoppingCart}
          title="Total Orders"
          value={stats.totalOrders}
          subtitle="All time"
        />
        <StatCard
          icon={TrendingUp}
          title="Revenue"
          value={`RWF ${stats.totalRevenue.toLocaleString()}`}
          subtitle="This month"
        />
        <StatCard
          icon={Clock}
          title="Pending Orders"
          value={stats.pendingOrders}
          subtitle="Awaiting processing"
          color="yellow"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/vendor/products/new')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
          >
            <Plus className="h-5 w-5 text-orange-500 mr-3" />
            <span className="font-medium text-gray-700">Add New Product</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/vendor/orders')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
          >
            <Eye className="h-5 w-5 text-orange-500 mr-3" />
            <span className="font-medium text-gray-700">View Orders</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/vendor/settings')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
          >
            <Edit className="h-5 w-5 text-orange-500 mr-3" />
            <span className="font-medium text-gray-700">Update Profile</span>
          </motion.button>
        </div>
      </div>

      {/* Account Status */}
      {user?.vendor?.status && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h2>
          <div className="flex items-center">
            {user.vendor.status === 'APPROVED' ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-green-700 font-medium">Your vendor account is approved and active</span>
              </>
            ) : user.vendor.status === 'PENDING' ? (
              <>
                <Clock className="h-5 w-5 text-yellow-500 mr-3" />
                <span className="text-yellow-700 font-medium">Your vendor account is pending approval</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <span className="text-red-700 font-medium">Your vendor account requires attention</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const PlaceholderComponent = ({ title }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600">This section is coming soon!</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-orange-500 text-white rounded-lg flex items-center justify-center">
                <Store className="h-4 w-4" />
              </div>
              <span className="ml-3 text-lg font-semibold text-gray-900">Vendor Portal</span>
            </div>
          </div>
          
          <nav className="px-3 pb-6">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 mb-1 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<VendorOverview />} />
            <Route path="/products" element={<PlaceholderComponent title="Products Management" />} />
            <Route path="/orders" element={<PlaceholderComponent title="Orders Management" />} />
            <Route path="/analytics" element={<PlaceholderComponent title="Analytics & Reports" />} />
            <Route path="/customers" element={<PlaceholderComponent title="Customer Management" />} />
            <Route path="/settings" element={<PlaceholderComponent title="Vendor Settings" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
