import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, Gift } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { cartAPI } from '../services/api';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, updateQuantity, removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState({});

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(prev => ({ ...prev, [itemId]: true }));
    try {
      await cartAPI.update(itemId, newQuantity);
      updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId) => {
    setUpdating(prev => ({ ...prev, [itemId]: true }));
    try {
      await cartAPI.remove(itemId);
      removeFromCart(itemId);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 50000 ? 0 : 2000; // Free shipping over 50,000 RWF
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
          {cartItems.length === 0 ? (
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
                    Cart Items ({cartItems.length})
                  </h2>
                  
                  <div className="space-y-6">
                    {cartItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="flex gap-6 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300"
                      >
                        {/* Product Image */}
                        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={item.product?.images?.[0] || item.image || '/api/placeholder/100/100'}
                            alt={item.product?.name || item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 truncate">
                                {item.product?.name || item.name}
                              </h3>
                              <p className="text-sm text-gray-500">{item.product?.vendor?.businessName || item.vendor}</p>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={updating[item.id]}
                              className="p-2 bg-gray-100 rounded-lg hover:bg-red-50 text-red-500 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </div>

                          <div className="flex items-center justify-between">
                            {/* Quantity Controls */}
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || updating[item.id]}
                                className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white disabled:opacity-50"
                              >
                                <Minus className="h-4 w-4" />
                              </motion.button>
                              <span className="w-12 text-center font-medium">
                                {item.quantity}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                disabled={updating[item.id]}
                                className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white disabled:opacity-50"
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
                                }).format((item.product?.price || item.price) * item.quantity)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Intl.NumberFormat('en-RW', {
                                  style: 'currency',
                                  currency: 'RWF'
                                }).format(item.product?.price || item.price)} each
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
                <div className="bg-white border border-gray-200 rounded-xl p-6">
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
                      {shipping === 0 ? (
                        <span className="text-green-600 font-medium">Free</span>
                      ) : (
                        <span>
                          {new Intl.NumberFormat('en-RW', {
                            style: 'currency',
                            currency: 'RWF'
                          }).format(shipping)}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span>Included</span>
                    </div>
                    {subtotal > 0 && subtotal < 50000 && (
                      <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                        Add {new Intl.NumberFormat('en-RW', {
                          style: 'currency',
                          currency: 'RWF'
                        }).format(50000 - subtotal)} more for free shipping
                      </div>
                    )}
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

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium text-lg py-4 rounded-lg transition-colors mb-4"
                  >
                    <span className="flex items-center justify-center">
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </span>
                  </motion.button>

                  <Link to="/products">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-lg transition-colors text-center block"
                    >
                      Continue Shopping
                    </motion.button>
                  </Link>
                </div>

                {/* Promo Code */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Gift className="h-5 w-5 mr-2 text-orange-500" />
                    Promo Code
                  </h4>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter code"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-6 py-3 rounded-lg transition-colors"
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
