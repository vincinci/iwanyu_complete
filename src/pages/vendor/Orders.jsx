import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  DollarSign,
  ShoppingBag,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VendorOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockOrders = [
      {
        id: 'ORD-001',
        customer: 'John Mukamana',
        email: 'john@example.com',
        phone: '+250781234567',
        products: [
          { name: 'Premium Coffee Beans', quantity: 2, price: 15000 },
          { name: 'Handwoven Basket', quantity: 1, price: 8500 }
        ],
        total: 38500,
        status: 'pending',
        paymentStatus: 'paid',
        shippingAddress: 'KG 123 St, Kigali, Rwanda',
        orderDate: '2024-01-20T10:30:00Z',
        notes: 'Please handle with care'
      },
      {
        id: 'ORD-002',
        customer: 'Marie Uwimana',
        email: 'marie@example.com',
        phone: '+250782345678',
        products: [
          { name: 'Traditional Fabric', quantity: 1, price: 25000 }
        ],
        total: 25000,
        status: 'processing',
        paymentStatus: 'paid',
        shippingAddress: 'KN 456 Ave, Kigali, Rwanda',
        orderDate: '2024-01-19T15:45:00Z',
        notes: ''
      },
      {
        id: 'ORD-003',
        customer: 'David Nkurunziza',
        email: 'david@example.com',
        phone: '+250783456789',
        products: [
          { name: 'Handwoven Basket', quantity: 3, price: 8500 }
        ],
        total: 25500,
        status: 'shipped',
        paymentStatus: 'paid',
        shippingAddress: 'KK 789 Rd, Kigali, Rwanda',
        orderDate: '2024-01-18T09:15:00Z',
        trackingNumber: 'TRK123456789',
        notes: 'Express delivery requested'
      },
      {
        id: 'ORD-004',
        customer: 'Sarah Umutesi',
        email: 'sarah@example.com',
        phone: '+250784567890',
        products: [
          { name: 'Premium Coffee Beans', quantity: 1, price: 15000 }
        ],
        total: 15000,
        status: 'delivered',
        paymentStatus: 'paid',
        shippingAddress: 'KG 321 St, Kigali, Rwanda',
        orderDate: '2024-01-15T14:20:00Z',
        deliveryDate: '2024-01-17T11:30:00Z',
        notes: ''
      }
    ];
    
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus }
        : order
    ));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.reduce((sum, o) => sum + o.total, 0)
  };

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600">Manage your customer orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <ShoppingBag className="h-6 w-6 text-orange-500" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Total Orders</p>
              <p className="text-lg font-bold text-gray-900">{orderStats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-yellow-500" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Pending</p>
              <p className="text-lg font-bold text-gray-900">{orderStats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-blue-500" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Processing</p>
              <p className="text-lg font-bold text-gray-900">{orderStats.processing}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Truck className="h-6 w-6 text-purple-500" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Shipped</p>
              <p className="text-lg font-bold text-gray-900">{orderStats.shipped}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Delivered</p>
              <p className="text-lg font-bold text-gray-900">{orderStats.delivered}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 text-green-600" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Revenue</p>
              <p className="text-lg font-bold text-gray-900">
                RWF {orderStats.revenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order {order.id}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.orderDate)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Customer</h4>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                    <p className="text-sm text-gray-500">{order.email}</p>
                    <p className="text-sm text-gray-500">{order.phone}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Products</h4>
                    {order.products.map((product, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        {product.quantity}x {product.name}
                      </p>
                    ))}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Total</h4>
                    <p className="text-lg font-bold text-orange-600">
                      RWF {order.total.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600 capitalize">
                      Payment: {order.paymentStatus}
                    </p>
                  </div>
                </div>

                {order.shippingAddress && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Shipping Address</h4>
                    <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                  </div>
                )}

                {order.notes && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Notes</h4>
                    <p className="text-sm text-gray-600">{order.notes}</p>
                  </div>
                )}

                {order.trackingNumber && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Tracking Number</h4>
                    <p className="text-sm text-gray-600 font-mono">{order.trackingNumber}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
                <button
                  onClick={() => navigate(`/vendor/orders/${order.id}`)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </button>
                
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'processing')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Start Processing
                  </button>
                )}
                
                {order.status === 'processing' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'shipped')}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Mark as Shipped
                  </button>
                )}
                
                {order.status === 'shipped' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'Orders will appear here when customers make purchases.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
