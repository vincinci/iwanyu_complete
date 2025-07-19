import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Settings,
  Bell,
  UserCheck,
  ShoppingBag,
  BarChart3,
  Tag
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Import admin pages
import AdminUsers from './Users';
import AdminVendors from './Vendors';
import AdminProducts from './Products';
import AdminOrders from './Orders';
import AdminCategories from './Categories';
// import AdminAnalytics from './AnalyticsSimple';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <div className="flex-1 ml-64">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="vendors" element={<AdminVendors />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="analytics" element={<SimpleAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const AdminSidebar = () => {
  const sidebarItems = [
    { icon: BarChart3, label: 'Overview', path: '/admin', exact: true },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Store, label: 'Vendors', path: '/admin/vendors' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: Tag, label: 'Categories', path: '/admin/categories' },
    { icon: TrendingUp, label: 'Analytics', path: '/admin/analytics' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="fixed left-0 top-16 h-full w-64 bg-white border-r border-gray-200 z-30">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-orange-700 border border-orange-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingVendors: 0,
    flaggedProducts: 0,
    totalRevenue: 0,
    monthlyGrowth: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      const data = response.data;
      
      setStats({
        totalUsers: data.totalUsers || 0,
        totalVendors: data.totalVendors || 0,
        totalProducts: data.totalProducts || 0,
        totalOrders: data.totalOrders || 0,
        pendingVendors: data.pendingVendors || 0,
        flaggedProducts: 0, // This would need to be added to the API
        totalRevenue: data.totalRevenue || 0,
        monthlyGrowth: 15.2 // This would need to be calculated on the backend
      });

      // Transform recent orders into activities
      const activities = (data.recentOrders || []).slice(0, 5).map((order, index) => ({
        id: order.id,
        type: 'order',
        message: `New order from ${order.user.firstName} ${order.user.lastName}: RWF ${order.total.toLocaleString()}`,
        time: new Date(order.createdAt).toLocaleDateString()
      }));

      setRecentActivities(activities);

      // For pending approvals, we'll fetch vendor applications
      const vendorsResponse = await adminAPI.getVendors({ status: 'PENDING' });
      const pendingVendors = (vendorsResponse.data.vendors || []).slice(0, 3).map(vendor => ({
        id: vendor.id,
        type: 'vendor',
        name: vendor.businessName,
        submitted: new Date(vendor.createdAt).toLocaleDateString()
      }));

      setPendingApprovals(pendingVendors);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, trend = 'up' }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? '↗' : '↘'} {change}%
            </p>
          )}
        </div>
        <div className="p-3 bg-orange-50 rounded-lg">
          <Icon className="w-6 h-6 text-orange-600" />
        </div>
      </div>
    </div>
  );

  const QuickAction = ({ title, description, icon: Icon, to, color = 'orange' }) => (
    <Link
      to={to}
      className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-200 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 bg-${color}-50 rounded-lg`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your e-commerce platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          change={12.5}
        />
        <StatCard
          title="Active Vendors"
          value={stats.totalVendors}
          icon={Store}
          change={8.2}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          icon={Package}
          change={15.7}
        />
        <StatCard
          title="Monthly Revenue"
          value={`RWF ${(stats.totalRevenue / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          change={stats.monthlyGrowth}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <QuickAction
                title="Manage Users"
                description="View and manage user accounts"
                icon={Users}
                to="/admin/users"
              />
              <QuickAction
                title="Vendor Approvals"
                description={`${stats.pendingVendors} pending approvals`}
                icon={UserCheck}
                to="/admin/vendors"
              />
              <QuickAction
                title="Product Moderation"
                description={`${stats.flaggedProducts} flagged products`}
                icon={Package}
                to="/admin/products"
              />
              <QuickAction
                title="Order Management"
                description="Monitor and manage orders"
                icon={ShoppingCart}
                to="/admin/orders"
              />
              <QuickAction
                title="Analytics"
                description="View platform analytics"
                icon={BarChart3}
                to="/admin/analytics"
              />
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'user' && <Users className="w-4 h-4 text-blue-500 mt-1" />}
                    {activity.type === 'vendor' && <Store className="w-4 h-4 text-green-500 mt-1" />}
                    {activity.type === 'order' && <ShoppingCart className="w-4 h-4 text-orange-500 mt-1" />}
                    {activity.type === 'product' && <Package className="w-4 h-4 text-purple-500 mt-1" />}
                    {activity.type === 'payment' && <DollarSign className="w-4 h-4 text-yellow-500 mt-1" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/admin/activities"
              className="block mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              View all activities →
            </Link>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h2>
            <div className="space-y-4">
              {pendingApprovals.map((item) => (
                <div key={item.id} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      {item.vendor && (
                        <p className="text-xs text-gray-600">by {item.vendor}</p>
                      )}
                      <p className="text-xs text-gray-500">Submitted: {item.submitted}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.type === 'vendor' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <button className="flex-1 text-xs bg-green-600 text-white py-1 px-2 rounded hover:bg-green-700">
                      Approve
                    </button>
                    <button className="flex-1 text-xs bg-red-600 text-white py-1 px-2 rounded hover:bg-red-700">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/admin/approvals"
              className="block mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              View all pending →
            </Link>
            </div>
        </div>
      </div>

      {/* Platform Health */}
      <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">System Status</p>
            <p className="text-xs text-green-600">All systems operational</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-2">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Response Time</p>
            <p className="text-xs text-yellow-600">Average: 120ms</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Uptime</p>
            <p className="text-xs text-blue-600">99.9% this month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SimpleAnalytics = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">RWF 12.4M</p>
            <p className="text-sm mt-1 text-green-600">↗ 15.2%</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <DollarSign className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">1,248</p>
            <p className="text-sm mt-1 text-green-600">↗ 8.7%</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <ShoppingCart className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Active Users</p>
            <p className="text-2xl font-bold text-gray-900">3,421</p>
            <p className="text-sm mt-1 text-green-600">↗ 12.3%</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <Users className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Active Vendors</p>
            <p className="text-2xl font-bold text-gray-900">156</p>
            <p className="text-sm mt-1 text-green-600">↗ 6.8%</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <Store className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Charts</h3>
      <p className="text-gray-600">Analytics with charts will be implemented here.</p>
      <p className="text-sm text-orange-600 mt-2">Note: Chart libraries need to be properly installed and configured.</p>
    </div>
  </div>
);

// Placeholder components for other admin pages
const AdminOrders = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-gray-900 mb-8">Order Management</h1>
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <p>Order management functionality will be implemented here</p>
    </div>
  </div>
);

const AdminSettings = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Settings</h1>
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <p>Admin settings will be implemented here</p>
    </div>
  </div>
);

export default AdminDashboard;
