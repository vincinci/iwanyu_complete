import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Load cart from localStorage or API
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Load from localStorage for guest users
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }
  }, [isAuthenticated]);

  // Save cart to localStorage for guest users
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await api.get('/api/cart');
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, variant = null, quantity = 1) => {
    try {
      const cartItem = {
        productId: product.id,
        variantId: variant?.id || null,
        quantity,
        product,
        variant,
      };

      if (isAuthenticated) {
        // Add to server cart
        const response = await api.post('/api/cart', {
          productId: product.id,
          variantId: variant?.id || null,
          quantity,
        });
        setCartItems(response.data.items);
      } else {
        // Add to local cart
        const existingItemIndex = cartItems.findIndex(
          item => item.productId === product.id && item.variantId === (variant?.id || null)
        );

        if (existingItemIndex > -1) {
          const updatedItems = [...cartItems];
          updatedItems[existingItemIndex].quantity += quantity;
          setCartItems(updatedItems);
        } else {
          setCartItems([...cartItems, { ...cartItem, id: Date.now().toString() }]);
        }
      }

      toast.success('Item added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }

    try {
      if (isAuthenticated) {
        const response = await api.put(`/api/cart/${itemId}`, { quantity });
        setCartItems(response.data.items);
      } else {
        const updatedItems = cartItems.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );
        setCartItems(updatedItems);
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      if (isAuthenticated) {
        await api.delete(`/api/cart/${itemId}`);
        setCartItems(cartItems.filter(item => item.id !== itemId));
      } else {
        setCartItems(cartItems.filter(item => item.id !== itemId));
      }
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        await api.delete('/api/cart');
      } else {
        localStorage.removeItem('cart');
      }
      setCartItems([]);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.variant?.price || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
