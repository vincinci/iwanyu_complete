import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
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
  ChevronRight
} from 'lucide-react';

const ProductDetail = () => {
  const { slug } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Black');
  const [activeTab, setActiveTab] = useState('description');

  // Mock product data
  const product = {
    id: 1,
    name: "Premium Wireless Headphones",
    price: 45000,
    originalPrice: 60000,
    rating: 4.8,
    reviews: 124,
    vendor: "AudioTech Rwanda",
    images: [
      "https://picsum.photos/600/600?random=1",
      "https://picsum.photos/600/600?random=2",
      "https://picsum.photos/600/600?random=3",
      "https://picsum.photos/600/600?random=4"
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Blue', 'Red'],
    description: "Experience crystal-clear audio with our premium wireless headphones. Featuring advanced noise cancellation technology and up to 30 hours of battery life.",
    features: [
      "Active Noise Cancellation",
      "30-hour battery life",
      "Premium leather comfort",
      "Hi-Res Audio certified",
      "Quick charge technology"
    ],
    inStock: true,
    freeShipping: true
  };

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
      <section className="py-6 border-b border-gray-200/20">
        <div className="container">
          <div className="text-sm text-gray-500 font-light">
            <span>Home</span> / <span>Products</span> / <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </section>

      <section className="py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Product Images */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-3xl glass-light">
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full aspect-square object-cover"
                />
                
                {/* Navigation Arrows */}
                <button
                  onClick={() => setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 glass-strong rounded-2xl flex items-center justify-center"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setSelectedImage((prev) => (prev + 1) % product.images.length)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 glass-strong rounded-2xl flex items-center justify-center"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Wishlist & Share */}
                <div className="absolute top-4 right-4 space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 glass-strong rounded-2xl flex items-center justify-center text-red-500"
                  >
                    <Heart className="h-6 w-6" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 glass-strong rounded-2xl flex items-center justify-center"
                  >
                    <Share2 className="h-6 w-6" />
                  </motion.button>
                </div>
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-2xl overflow-hidden ${
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
                <p className="text-blue-600 font-medium mb-2">{product.vendor}</p>
                <h1 className="text-4xl font-light text-gray-900 mb-4">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 font-medium">{product.rating}</span>
                  </div>
                  <span className="text-gray-500">({product.reviews} reviews)</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-3xl font-bold text-gray-900">
                    {new Intl.NumberFormat('en-RW', {
                      style: 'currency',
                      currency: 'RWF'
                    }).format(product.price)}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    {new Intl.NumberFormat('en-RW', {
                      style: 'currency',
                      currency: 'RWF'
                    }).format(product.originalPrice)}
                  </span>
                  <span className="px-3 py-1 glass-strong rounded-full text-sm font-medium text-green-600">
                    Save {Math.floor(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                </div>
              </div>

              {/* Variants */}
              <div className="space-y-6">
                {/* Color Selection */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Color</h3>
                  <div className="flex gap-3">
                    {product.colors.map((color) => (
                      <motion.button
                        key={color}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-2xl border transition-all ${
                          selectedColor === color
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 glass-light hover:border-gray-400'
                        }`}
                      >
                        {color}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Size Selection */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Size</h3>
                  <div className="flex gap-3">
                    {product.sizes.map((size) => (
                      <motion.button
                        key={size}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-2xl border transition-all ${
                          selectedSize === size
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 glass-light hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Quantity</h3>
                  <div className="flex items-center glass-light rounded-2xl p-1 w-fit">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/50"
                    >
                      <Minus className="h-5 w-5" />
                    </motion.button>
                    <span className="w-16 text-center font-medium text-lg">{quantity}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/50"
                    >
                      <Plus className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 btn btn-primary text-lg py-4"
                >
                  <span className="flex items-center justify-center">
                    <ShoppingBag className="mr-3 h-5 w-5" />
                    Add to Cart
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-secondary px-8 py-4"
                >
                  <MessageCircle className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 glass-light rounded-2xl">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Secure Payment</p>
                </div>
                <div className="text-center p-4 glass-light rounded-2xl">
                  <Truck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Free Shipping</p>
                </div>
                <div className="text-center p-4 glass-light rounded-2xl">
                  <RotateCcw className="h-8 w-8 text-white mx-auto mb-2" />
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
            <div className="card">
              {/* Tab Navigation */}
              <div className="flex gap-8 mb-8 border-b border-gray-200">
                {['description', 'features', 'reviews'].map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ y: -2 }}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-lg font-medium transition-colors relative ${
                      activeTab === tab ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
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
                      <p className="text-gray-700 font-light leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  )}
                  
                  {activeTab === 'features' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.features.map((feature, index) => (
                        <div key={index} className="flex items-center p-4 glass-light rounded-2xl">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                          <span className="font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {activeTab === 'reviews' && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Reviews coming soon...</p>
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
