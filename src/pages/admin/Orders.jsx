import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        status: filterStatus !== 'all' ? filterStatus.toUpperCase() : undefined
      };

      const response = await adminAPI.getOrders(params);
      const transformedOrders = response.data.orders.map(order => ({
        id: order.id,
        orderNumber: `#ORD-${order.id.toString().padStart(6, '0')}`,
        customer: `${order.user.firstName} ${order.user.lastName}`,
        email: order.user.email,
        items: order.items,
        total: order.total,
        status: order.status.toLowerCase(),
        createdAt: new Date(order.createdAt).toLocaleDateString(),
        updatedAt: new Date(order.updatedAt).toLocaleDateString(),
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod || 'flutterwave'
      }));

      setOrders(transformedOrders);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const OrderModal = ({ order, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Information */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Order Information</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Order Number</label>
                <p className="font-medium">{order.orderNumber}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Date</label>
                <p className="font-medium">{order.createdAt}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(order.status)}
                  <span className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Total Amount</label>
                <p className="text-xl font-bold text-orange-600">RWF {order.total.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Payment Method</label>
                <p className="font-medium capitalize">{order.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Customer Information</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <p className="font-medium">{order.customer}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="font-medium">{order.email}</p>
              </div>
              {order.shippingAddress && (
                <div>
                  <label className="text-sm text-gray-600">Shipping Address</label>
                  <p className="font-medium">{order.shippingAddress}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mt-6">
          <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">RWF {item.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="animate-pulse space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600">Monitor and manage customer orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
          {['pending', 'processing', 'shipped', 'delivered'].map((status) => {
            const count = orders.filter(order => order.status === status).length;
            return (
              <div key={status} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getStatusIcon(status)}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 capitalize">{status}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-64"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
            <div className="text-sm text-gray-600">
              {filteredOrders.length} orders found
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.customer}</p>
                        <p className="text-sm text-gray-600">{order.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{order.items.length} items</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">RWF {order.total.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`inline-block px-3 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Order Modal */}
        {showOrderModal && selectedOrder && (
          <OrderModal
            order={selectedOrder}
            onClose={() => {
              setShowOrderModal(false);
              setSelectedOrder(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
