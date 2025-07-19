import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Ban, CheckCircle, AlertTriangle, Package, Star, DollarSign } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, filterCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        category: filterCategory !== 'all' ? filterCategory : undefined
      };

      const response = await adminAPI.getProducts(params);
      const transformedProducts = response.data.products.map(product => ({
        id: product.id,
        name: product.name,
        vendor: product.vendor?.businessName || 'Unknown Vendor',
        vendorId: product.vendorId,
        category: product.category?.name || 'Uncategorized',
        price: product.price,
        stock: product.stock || 0,
        status: product.isActive ? 'active' : 'inactive',
        flagged: false, // This would need to be added to the API
        images: product.images?.map(img => img.url) || [],
        description: product.description,
        rating: 0, // This would need to be calculated
        reviews: 0, // This would need to be calculated
        createdAt: new Date(product.createdAt).toLocaleDateString(),
        lastModified: new Date(product.updatedAt).toLocaleDateString()
      }));

      setProducts(transformedProducts);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductAction = async (productId, action) => {
    try {
      if (action === 'toggle-status') {
        await adminAPI.updateProduct(productId, {});
        toast.success('Product status updated successfully');
        fetchProducts();
      } else if (action === 'view') {
        const product = products.find(p => p.id === productId);
        setSelectedProduct(product);
        setShowProductModal(true);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="animate-pulse space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ProductModal = ({ product, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Product Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Information */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-4">Product Information</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Product Name</label>
                <p className="font-medium text-lg">{product.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Category</label>
                <p className="font-medium">{product.category}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Price</label>
                <p className="font-medium text-lg text-orange-600">RWF {product.price.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Stock</label>
                <p className={`font-medium ${product.stock === 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {product.stock} units
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Description</label>
                <p className="text-gray-900">{product.description}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                  product.status === 'active' ? 'bg-green-100 text-green-800' :
                  product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {product.status}
                </span>
                {product.flagged && (
                  <span className="ml-2 inline-block px-3 py-1 text-sm rounded-full bg-red-100 text-red-800">
                    Flagged
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Vendor & Performance */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Vendor & Performance</h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Vendor</label>
                <p className="font-medium">{product.vendor}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm text-yellow-600">Rating</span>
                  </div>
                  <p className="text-xl font-bold text-yellow-900">
                    {product.rating > 0 ? product.rating.toFixed(1) : 'N/A'}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-blue-600">Reviews</span>
                  </div>
                  <p className="text-xl font-bold text-blue-900">{product.reviews}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Created</label>
                  <p className="font-medium">{product.createdAt}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Last Modified</label>
                  <p className="font-medium">{product.lastModified}</p>
                </div>
              </div>

              {product.flagged && product.flagReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Flagged for Review</p>
                      <p className="text-sm text-red-600 mt-1">{product.flagReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {product.suspensionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Ban className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Suspension Reason</p>
                      <p className="text-sm text-red-600 mt-1">{product.suspensionReason}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 mt-8 pt-6 border-t">
          {product.status === 'pending' && (
            <button
              onClick={() => {
                handleProductAction(product.id, 'approve');
                onClose();
              }}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve</span>
            </button>
          )}
          {product.status === 'active' && !product.flagged && (
            <button
              onClick={() => {
                const reason = prompt('Reason for flagging:');
                if (reason) {
                  // Note: Flag functionality would need to be implemented in the API
                  toast.info('Flag functionality will be implemented');
                  onClose();
                }
              }}
              className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 flex items-center justify-center space-x-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Flag</span>
            </button>
          )}
          {product.flagged && (
            <button
              onClick={() => {
                // Note: Unflag functionality would need to be implemented in the API
                toast.info('Unflag functionality will be implemented');
                onClose();
              }}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Remove Flag
            </button>
          )}
          {product.status === 'active' && (
            <button
              onClick={() => {
                handleProductAction(product.id, 'toggle-status');
                onClose();
              }}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
            >
              <Ban className="w-4 h-4" />
              <span>Deactivate</span>
            </button>
          )}
          {product.status === 'inactive' && (
            <button
              onClick={() => {
                handleProductAction(product.id, 'toggle-status');
                onClose();
              }}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            >
              Activate
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Toys'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600">Monitor and moderate platform products</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Flagged</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.flagged).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.length > 0 ? 
                    `${Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length / 1000)}K` : 
                    '0'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-600">
              {filteredProducts.length} products found
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {product.name}
                            {product.flagged && (
                              <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.vendor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      RWF {product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${product.stock === 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' :
                        product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.rating > 0 ? (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          {product.rating.toFixed(1)} ({product.reviews})
                        </div>
                      ) : (
                        'No reviews'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowProductModal(true);
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

        {/* Product Modal */}
        {showProductModal && selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => {
              setShowProductModal(false);
              setSelectedProduct(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
