import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, Gift } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const { cartItems, getCartTotal, updateQuantity, removeFromCart } = useCart();
  
  // Mock cart items for demo
  const mockCartItems = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 45000,
      quantity: 2,
      image: "https://picsum.photos/200/200?random=1",
      vendor: "AudioTech RW"
    },
    {
      id: 2,
      name: "Organic Coffee Beans",
      price: 12000,
      quantity: 1,
      image: "https://picsum.photos/200/200?random=2",
      vendor: "Rwanda Coffee Co."
    }
  ];

  const items = cartItems.length > 0 ? cartItems : mockCartItems;
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;
  
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
      {/* Header */}
      <section className="py-16 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Shopping{' '}
              <span className="text-orange-500">Cart</span>
            </h1>
            <p className="text-lg text-gray-600">
              Review your items and proceed to checkout
            </p>
          </div>
        </motion.div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-20"
            >
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <ShoppingBag className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h3>
              <p className="text-gray-600 mb-8">
                Discover amazing products and add them to your cart
              </p>
              <Link to="/products">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors flex items-center mx-auto"
                >
                  Start Shopping
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-3 gap-12"
            >
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <motion.div variants={itemVariants} className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                    Cart Items ({items.length})
                  </h2>
                  
                  <div className="space-y-6">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="flex gap-6 p-6 glass-light rounded-2xl hover:glass-medium transition-all duration-300"
                      >
                        {/* Product Image */}
                        <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 truncate">
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-500">{item.vendor}</p>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeFromCart && removeFromCart(item.id)}
                              className="p-2 glass-light rounded-xl hover:bg-red-50 text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </div>

                          <div className="flex items-center justify-between">
                            {/* Quantity Controls */}
                            <div className="flex items-center glass-light rounded-2xl p-1">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateQuantity && updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/50"
                              >
                                <Minus className="h-4 w-4" />
                              </motion.button>
                              <span className="w-12 text-center font-medium">
                                {item.quantity}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateQuantity && updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/50"
                              >
                                <Plus className="h-4 w-4" />
                              </motion.button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900">
                                {new Intl.NumberFormat('en-RW', {
                                  style: 'currency',
                                  currency: 'RWF'
                                }).format(item.price * item.quantity)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Intl.NumberFormat('en-RW', {
                                  style: 'currency',
                                  currency: 'RWF'
                                }).format(item.price)} each
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Order Summary */}
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="card">
                  <h3 className="text-xl font-medium text-gray-900 mb-6">Order Summary</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>
                        {new Intl.NumberFormat('en-RW', {
                          style: 'currency',
                          currency: 'RWF'
                        }).format(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span>Included</span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>Total</span>
                      <span>
                        {new Intl.NumberFormat('en-RW', {
                          style: 'currency',
                          currency: 'RWF'
                        }).format(total)}
                      </span>
                    </div>
                  </div>

                  <Link to="/checkout">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full btn btn-primary text-lg py-4 mb-4"
                    >
                      <span className="flex items-center justify-center">
                        Proceed to Checkout
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </span>
                    </motion.button>
                  </Link>

                  <Link to="/products">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full btn btn-secondary text-center"
                    >
                      Continue Shopping
                    </motion.button>
                  </Link>
                </div>

                {/* Promo Code */}
                <div className="card">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Gift className="h-5 w-5 mr-2 text-white" />
                    Promo Code
                  </h4>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter code"
                      className="flex-1 input"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn btn-secondary px-6"
                    >
                      Apply
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Cart;
