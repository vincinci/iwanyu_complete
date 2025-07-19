import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell
} from 'recharts';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell
} from 'recharts';
import { vendorAPI } from '../../services/api';
import toast from 'react-hot-toast';

const VendorAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [salesData, setSalesData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch real analytics data from API
      const response = await vendorAPI.getAnalytics();
      const data = response.data;
      
      setAnalytics({
        totalProducts: data.totalProducts || 0,
        totalOrders: data.totalOrders || 0,
        totalRevenue: data.totalRevenue || 0,
        pendingOrders: data.pendingOrders || 0
      });

      // For now, use mock data for charts since detailed analytics API would need more implementation
      // In a real implementation, these would come from API endpoints with time-based data
      const mockSalesData = [
        { date: '2024-01-14', sales: 45000, orders: 12, customers: 8 },
        { date: '2024-01-15', sales: 52000, orders: 15, customers: 11 },
        { date: '2024-01-16', sales: 38000, orders: 10, customers: 7 },
        { date: '2024-01-17', sales: 61000, orders: 18, customers: 14 },
        { date: '2024-01-18', sales: 55000, orders: 16, customers: 12 },
        { date: '2024-01-19', sales: 49000, orders: 14, customers: 9 },
        { date: '2024-01-20', sales: 67000, orders: 21, customers: 16 }
      ];

      const mockProductData = [
        { name: 'Premium Coffee Beans', sales: 156000, orders: 52 },
        { name: 'Handwoven Basket', sales: 89000, orders: 34 },
        { name: 'Traditional Fabric', sales: 125000, orders: 28 },
        { name: 'Artisan Pottery', sales: 67000, orders: 23 },
        { name: 'Organic Honey', sales: 45000, orders: 18 }
      ];

      const mockCategoryData = [
        { name: 'Food & Beverages', value: 35, sales: 201000 },
        { name: 'Fashion', value: 25, sales: 145000 },
        { name: 'Home & Garden', value: 20, sales: 116000 },
        { name: 'Crafts', value: 15, sales: 87000 },
        { name: 'Others', value: 5, sales: 29000 }
      ];

      setSalesData(mockSalesData);
      setProductData(mockProductData);
      setCategoryData(mockCategoryData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const totalSales = analytics.totalRevenue;
  const totalOrders = analytics.totalOrders;
  const totalCustomers = salesData.reduce((sum, day) => sum + day.customers, 0);
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Calculate growth rates (mock calculation - would need historical data from API)
  const salesGrowth = 12.5;
  const ordersGrowth = 8.3;
  const customersGrowth = 15.7;
  const aovGrowth = 4.2;

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

  const StatCard = ({ icon: Icon, title, value, change, changeType, subtitle }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-orange-50 rounded-lg">
          <Icon className="h-6 w-6 text-orange-500" />
        </div>
        <div className={`flex items-center text-sm ${
          changeType === 'positive' ? 'text-green-600' : 'text-red-600'
        }`}>
          {changeType === 'positive' ? (
            <ArrowUpRight className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 mr-1" />
          )}
          {change}%
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your business performance</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="mt-4 sm:mt-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          title="Total Sales"
          value={`RWF ${totalSales.toLocaleString()}`}
          change={salesGrowth}
          changeType="positive"
          subtitle="vs previous period"
        />
        <StatCard
          icon={ShoppingBag}
          title="Total Orders"
          value={totalOrders.toString()}
          change={ordersGrowth}
          changeType="positive"
          subtitle="vs previous period"
        />
        <StatCard
          icon={Users}
          title="Customers"
          value={totalCustomers.toString()}
          change={customersGrowth}
          changeType="positive"
          subtitle="unique customers"
        />
        <StatCard
          icon={TrendingUp}
          title="Avg Order Value"
          value={`RWF ${Math.round(avgOrderValue).toLocaleString()}`}
          change={aovGrowth}
          changeType="positive"
          subtitle="per order"
        />
      </div>

      {/* Sales Trend Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Sales Trend</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Sales</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Orders</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value, name) => [
                  name === 'sales' ? `RWF ${value.toLocaleString()}` : value,
                  name === 'sales' ? 'Sales' : 'Orders'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#f97316" 
                fill="#f9731620" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="orders" 
                stroke="#3b82f6" 
                fill="#3b82f620" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Products</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'sales' ? `RWF ${value.toLocaleString()}` : value,
                    name === 'sales' ? 'Sales' : 'Orders'
                  ]}
                />
                <Bar dataKey="sales" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Sales by Category</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value}% (RWF ${props.payload.sales.toLocaleString()})`,
                    'Sales Share'
                  ]}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm text-gray-600">{category.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {category.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Performance Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="font-medium text-gray-900">Growing Sales</h3>
            <p className="text-sm text-gray-600 mt-1">
              Your sales have increased by 12.5% compared to last period
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-medium text-gray-900">Customer Growth</h3>
            <p className="text-sm text-gray-600 mt-1">
              You've gained 15.7% more customers this period
            </p>
          </div>
          <div className="text-center">
            <div className="bg-orange-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="font-medium text-gray-900">Product Performance</h3>
            <p className="text-sm text-gray-600 mt-1">
              Premium Coffee Beans is your top-selling product
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorAnalytics;
