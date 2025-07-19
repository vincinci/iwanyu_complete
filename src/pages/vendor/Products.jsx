import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Package,
  DollarSign,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { vendorAPI, productAPI } from '../../services/api';
import toast from 'react-hot-toast';

const VendorProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    outOfStock: 0,
    revenue: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await vendorAPI.getProducts({
        search: searchTerm,
        status: filter !== 'all' ? filter : undefined
      });
      
      setProducts(response.data.products || []);
      
      // Calculate stats
      const totalProducts = response.data.products?.length || 0;
      const activeProducts = response.data.products?.filter(p => p.isActive)?.length || 0;
      const outOfStock = response.data.products?.filter(p => p.stock === 0)?.length || 0;
      const totalRevenue = response.data.products?.reduce((sum, p) => sum + (p.sales || 0) * p.price, 0) || 0;
      
      setStats({
        total: totalProducts,
        active: activeProducts,
        outOfStock: outOfStock,
        revenue: totalRevenue
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, filter]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && product.isActive) ||
                         (filter === 'inactive' && !product.isActive) ||
                         (filter === 'outOfStock' && product.stock === 0);
    return matchesSearch && matchesFilter;
  });

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(productId);
        setProducts(products.filter(p => p.id !== productId));
        toast.success('Product deleted successfully');
        fetchProducts(); // Refresh stats
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const toggleProductStatus = async (productId) => {
    try {
      const product = products.find(p => p.id === productId);
      const newStatus = !product.isActive;
      
      await productAPI.update(productId, { isActive: newStatus });
      
      setProducts(products.map(p => 
        p.id === productId 
          ? { ...p, isActive: newStatus }
          : p
      ));
      
      toast.success(`Product ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchProducts(); // Refresh stats
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Failed to update product status');
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/vendor/products/new')}
          className="mt-4 sm:mt-0 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">
                {new Intl.NumberFormat('en-RW', {
                  style: 'currency',
                  currency: 'RWF',
                  maximumFractionDigits: 0
                }).format(stats.revenue)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-xl font-bold text-gray-900">{stats.outOfStock}</p>
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
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">All Products</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="outOfStock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={product.images?.[0] || '/api/placeholder/100/100'}
                          alt={product.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.category?.name || 'Uncategorized'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sku || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Intl.NumberFormat('en-RW', {
                      style: 'currency',
                      currency: 'RWF'
                    }).format(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.stock === 0 
                        ? 'bg-red-100 text-red-800'
                        : product.stock < 10
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.salesCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="text-gray-400 hover:text-gray-600"
                        title="View Product"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/vendor/products/${product.id}/edit`)}
                        className="text-gray-400 hover:text-orange-600"
                        title="Edit Product"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleProductStatus(product.id)}
                        className="text-gray-400 hover:text-blue-600"
                        title={product.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <Package className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filter !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'Get started by adding your first product.'}
          </p>
          {!searchTerm && filter === 'all' && (
            <div className="mt-6">
              <button
                onClick={() => navigate('/vendor/products/new')}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add Product
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorProducts;
