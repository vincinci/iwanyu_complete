import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Heart, 
  Share2, 
  ShoppingBag, 
  Plus, 
  Minus,
  Shield,
  Truck,
  RotateCcw,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { productAPI, cartAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getById(id);
        setProduct(response.data.product);
        
        // Set default variant if available
        if (response.data.product.variants && response.data.product.variants.length > 0) {
          setSelectedVariant(response.data.product.variants[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Product not found');
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await cartAPI.add(product.id, quantity);
      addToCart(product, quantity);
      toast.success('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart');
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Breadcrumb */}
      <section className="py-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button onClick={() => navigate('/')} className="hover:text-orange-500">Home</button>
            <span>/</span>
            <button onClick={() => navigate('/products')} className="hover:text-orange-500">Products</button>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </section>

      <section className="py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Product Images */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-xl bg-gray-100">
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  src={product.images && product.images.length > 0 ? product.images[selectedImage] : '/api/placeholder/600/600'}
                  alt={product.name}
                  className="w-full aspect-square object-cover"
                />
                
                {/* Navigation Arrows */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev + 1) % product.images.length)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Wishlist & Share */}
                <div className="absolute top-4 right-4 space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center text-red-500 hover:bg-red-50"
                  >
                    <Heart className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50"
                  >
                    <Share2 className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? 'border-orange-500' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
                      selectedImage === index ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div variants={itemVariants} className="space-y-8">
              {/* Header */}
              <div>
                <p className="text-orange-600 font-medium mb-2">{product.vendor?.businessName || 'Iwanyu Vendor'}</p>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.averageRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 font-medium">{product.averageRating || 0}</span>
                  </div>
                  <span className="text-gray-500">({product.reviewCount || 0} reviews)</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-3xl font-bold text-gray-900">
                    {new Intl.NumberFormat('en-RW', {
                      style: 'currency',
                      currency: 'RWF'
                    }).format(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        {new Intl.NumberFormat('en-RW', {
                          style: 'currency',
                          currency: 'RWF'
                        }).format(product.originalPrice)}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Save {Math.floor(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Options</h3>
                    <div className="flex flex-wrap gap-3">
                      {product.variants.map((variant) => (
                        <motion.button
                          key={variant.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedVariant(variant)}
                          className={`px-4 py-2 rounded-lg border transition-all ${
                            selectedVariant?.id === variant.id
                              ? 'border-orange-500 bg-orange-50 text-orange-700'
                              : 'border-gray-300 bg-white hover:border-gray-400'
                          }`}
                        >
                          {variant.name}
                          {variant.price !== product.price && (
                            <span className="ml-2 text-sm">
                              (+{new Intl.NumberFormat('en-RW', {
                                style: 'currency',
                                currency: 'RWF'
                              }).format(variant.price - product.price)})
                            </span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center bg-gray-100 rounded-lg p-1 w-fit">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-5 w-5" />
                  </motion.button>
                  <span className="w-16 text-center font-medium text-lg">{quantity}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (product.stock || 1)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-5 w-5" />
                  </motion.button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {product.stock} items available
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={!product.isActive || product.stock === 0}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium text-lg py-4 rounded-lg transition-colors"
                >
                  <span className="flex items-center justify-center">
                    <ShoppingBag className="mr-3 h-5 w-5" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-lg transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Shield className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-sm font-medium">Secure Payment</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Truck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Free Shipping</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <RotateCcw className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Easy Returns</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Product Details Tabs */}
          <motion.div
            variants={itemVariants}
            className="mt-20"
          >
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              {/* Tab Navigation */}
              <div className="flex gap-8 mb-8 border-b border-gray-200">
                {[
                  { id: 'description', label: 'Description' },
                  { id: 'specifications', label: 'Specifications' },
                  { id: 'reviews', label: 'Reviews' }
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ y: -2 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-4 text-lg font-medium transition-colors relative ${
                      activeTab === tab.id ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-full"
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'description' && (
                    <div className="prose prose-lg max-w-none">
                      <p className="text-gray-700 leading-relaxed">
                        {product.description || 'No description available.'}
                      </p>
                      {product.features && product.features.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {product.features.map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <span className="text-gray-700">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'specifications' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {product.specifications ? (
                        Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-3 border-b border-gray-200">
                            <span className="font-medium text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="text-gray-600">{value}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 col-span-2">No specifications available.</p>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'reviews' && (
                    <div className="text-center py-12">
                      <div className="mb-4">
                        <div className="flex items-center justify-center mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < Math.floor(product.averageRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-lg font-medium">{product.averageRating || 0}</span>
                        </div>
                        <p className="text-gray-600">{product.reviewCount || 0} customer reviews</p>
                      </div>
                      {product.reviewCount === 0 && (
                        <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default ProductDetail;
