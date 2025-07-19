import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingCart, DollarSign, Package, Store, BarChart3, PieChart, Download } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Cell,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const AdminAnalytics = () => {
  const [timeframe, setTimeframe] = useState('7d');
  const [analytics, setAnalytics] = useState({
    overview: {},
    revenue: [],
    users: [],
    orders: [],
    categories: [],
    topVendors: [],
    topProducts: []
  });

  useEffect(() => {
    // Mock data - replace with real API calls
    setAnalytics({
      overview: {
        totalRevenue: 12450000,
        revenueGrowth: 15.2,
        totalOrders: 1248,
        ordersGrowth: 8.7,
        activeUsers: 3421,
        usersGrowth: 12.3,
        activeVendors: 156,
        vendorsGrowth: 6.8
      },
      revenue: [
        { date: '2024-01-14', amount: 450000 },
        { date: '2024-01-15', amount: 520000 },
        { date: '2024-01-16', amount: 480000 },
        { date: '2024-01-17', amount: 620000 },
        { date: '2024-01-18', amount: 580000 },
        { date: '2024-01-19', amount: 720000 },
        { date: '2024-01-20', amount: 680000 }
      ],
      users: [
        { date: '2024-01-14', new: 12, returning: 45 },
        { date: '2024-01-15', new: 18, returning: 52 },
        { date: '2024-01-16', new: 15, returning: 48 },
        { date: '2024-01-17', new: 22, returning: 58 },
        { date: '2024-01-18', new: 25, returning: 61 },
        { date: '2024-01-19', new: 28, returning: 65 },
        { date: '2024-01-20', new: 24, returning: 59 }
      ],
      orders: [
        { date: '2024-01-14', orders: 24 },
        { date: '2024-01-15', orders: 32 },
        { date: '2024-01-16', orders: 28 },
        { date: '2024-01-17', orders: 38 },
        { date: '2024-01-18', orders: 35 },
        { date: '2024-01-19', orders: 42 },
        { date: '2024-01-20', orders: 39 }
      ],
      categories: [
        { name: 'Electronics', value: 35, color: '#3B82F6' },
        { name: 'Fashion', value: 25, color: '#EF4444' },
        { name: 'Home & Garden', value: 20, color: '#10B981' },
        { name: 'Sports', value: 12, color: '#F59E0B' },
        { name: 'Books', value: 5, color: '#8B5CF6' },
        { name: 'Others', value: 3, color: '#6B7280' }
      ],
      topVendors: [
        { name: 'Tech Store Rwanda', revenue: 2450000, orders: 128, growth: 15.2 },
        { name: 'Fashion Forward RW', revenue: 1850000, orders: 95, growth: 12.8 },
        { name: 'Home & Garden Plus', revenue: 1250000, orders: 78, growth: -2.3 },
        { name: 'Sports Zone', revenue: 980000, orders: 56, growth: 8.7 },
        { name: 'Book Corner', revenue: 650000, orders: 42, growth: 5.2 }
      ],
      topProducts: [
        { name: 'iPhone 15 Pro Max', vendor: 'Tech Store Rwanda', sales: 45, revenue: 675000 },
        { name: 'Designer Handbag', vendor: 'Fashion Forward RW', sales: 32, revenue: 272000 },
        { name: 'Gaming Laptop', vendor: 'Tech Store Rwanda', sales: 28, revenue: 274400 },
        { name: 'Garden Tools Set', vendor: 'Home & Garden Plus', sales: 24, revenue: 108000 },
        { name: 'Running Shoes', vendor: 'Sports Zone', sales: 22, revenue: 132000 }
      ]
    });
  }, [timeframe]);

  const StatCard = ({ title, value, change, icon: Icon, trend = 'up', prefix = '', suffix = '' }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{prefix}{value}{suffix}</p>
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

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Platform performance and insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(analytics.overview.totalRevenue)}
            change={analytics.overview.revenueGrowth}
            icon={DollarSign}
            prefix="RWF "
          />
          <StatCard
            title="Total Orders"
            value={analytics.overview.totalOrders?.toLocaleString()}
            change={analytics.overview.ordersGrowth}
            icon={ShoppingCart}
          />
          <StatCard
            title="Active Users"
            value={analytics.overview.activeUsers?.toLocaleString()}
            change={analytics.overview.usersGrowth}
            icon={Users}
          />
          <StatCard
            title="Active Vendors"
            value={analytics.overview.activeVendors}
            change={analytics.overview.vendorsGrowth}
            icon={Store}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis tickFormatter={(value) => `${value / 1000}K`} />
                <Tooltip 
                  formatter={(value) => [`RWF ${value.toLocaleString()}`, 'Revenue']}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Area type="monotone" dataKey="amount" stroke="#ea580c" fill="#fed7aa" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Users Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Activity</h3>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.users}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Legend />
                <Bar dataKey="new" fill="#ea580c" name="New Users" />
                <Bar dataKey="returning" fill="#fed7aa" name="Returning Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Orders Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Daily Orders</h3>
              <ShoppingCart className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.orders}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line type="monotone" dataKey="orders" stroke="#ea580c" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Sales by Category</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={analytics.categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {analytics.categories.map((category, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                    <span className="text-gray-600">{category.name}</span>
                  </div>
                  <span className="font-medium">{category.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Vendors */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Vendors</h3>
              <Store className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {analytics.topVendors.map((vendor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
                    <p className="text-xs text-gray-500">{vendor.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      RWF {formatCurrency(vendor.revenue)}
                    </p>
                    <p className={`text-xs ${vendor.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {vendor.growth >= 0 ? '+' : ''}{vendor.growth}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Vendor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Sales</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topProducts.map((product, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{product.vendor}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{product.sales} units</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      RWF {product.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
