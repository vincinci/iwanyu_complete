const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { initializeFlutterwave } = require('../services/flutterwaveService');
const router = express.Router();

// Get user orders
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                slug: true,
              }
            },
            variant: {
              select: {
                id: true,
                name: true,
                value: true,
              }
            },
            vendor: {
              select: {
                id: true,
                businessName: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit),
    });

    const total = await prisma.order.count({ where });

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Failed to get orders' });
  }
});

// Get order by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                slug: true,
              }
            },
            variant: {
              select: {
                id: true,
                name: true,
                value: true,
              }
            },
            vendor: {
              select: {
                id: true,
                businessName: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Failed to get order' });
  }
});

// Create order
router.post('/', authenticate, [
  body('shippingAddress').isObject(),
  body('paymentMethod').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { shippingAddress, billingAddress, paymentMethod, notes } = req.body;

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            vendor: true,
          }
        },
        variant: true,
      }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const price = item.variant?.price || item.product.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId,
        vendorId: item.product.vendorId,
        quantity: item.quantity,
        price: price,
        total: itemTotal,
      });
    }

    const shippingCost = 0; // Free shipping for now
    const tax = subtotal * 0.18; // 18% VAT
    const total = subtotal + shippingCost + tax;

    // Generate order number
    const orderNumber = `IW${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.user.id,
        subtotal,
        shippingCost,
        tax,
        total,
        shippingAddress,
        billingAddress,
        paymentMethod,
        notes,
        items: {
          create: orderItems,
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              }
            },
            variant: true,
          }
        }
      }
    });

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id }
    });

    // Update product stock
    for (const item of cartItems) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } }
        });
      } else {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }
    }

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// Initialize payment
router.post('/:id/payment', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    const flw = initializeFlutterwave();
    
    const payload = {
      tx_ref: `${order.orderNumber}_${Date.now()}`,
      amount: order.total,
      currency: 'RWF',
      redirect_url: `${process.env.FRONTEND_URL}/orders/${order.id}/payment/callback`,
      customer: {
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`,
        phonenumber: req.user.phone || '',
      },
      customizations: {
        title: 'Iwanyu Payment',
        logo: 'https://iwanyu.rw/logo.png',
      },
    };

    const response = await flw.StandardSubaccount.create(payload);
    
    if (response.status === 'success') {
      // Update order with payment ID
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentId: payload.tx_ref }
      });

      res.json({
        message: 'Payment initialized',
        payment_link: response.data.link,
        tx_ref: payload.tx_ref
      });
    } else {
      res.status(400).json({ message: 'Payment initialization failed' });
    }
  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({ message: 'Failed to initialize payment' });
  }
});

// Payment callback
router.post('/payment/callback', async (req, res) => {
  try {
    const { tx_ref, transaction_id } = req.body;

    if (!tx_ref || !transaction_id) {
      return res.status(400).json({ message: 'Missing transaction details' });
    }

    const flw = initializeFlutterwave();
    
    // Verify transaction
    const response = await flw.Transaction.verify({ id: transaction_id });
    
    if (response.data.status === 'successful' && response.data.amount && response.data.currency === 'RWF') {
      // Find order by payment ID
      const order = await prisma.order.findFirst({
        where: { paymentId: tx_ref }
      });

      if (order && order.total === response.data.amount) {
        // Update order status
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
          }
        });

        res.json({ message: 'Payment verified successfully' });
      } else {
        res.status(400).json({ message: 'Payment verification failed' });
      }
    } else {
      res.status(400).json({ message: 'Transaction verification failed' });
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({ message: 'Payment callback failed' });
  }
});

// Cancel order
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        items: true,
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
      return res.status(400).json({ message: 'Order cannot be cancelled' });
    }

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' }
    });

    // Restore product stock
    for (const item of order.items) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } }
        });
      } else {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }
    }

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Failed to cancel order' });
  }
});

// Vendor routes
router.get('/vendor/orders', authenticate, authorize('VENDOR'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const where = { vendorId: vendor.id };
    if (status) where.status = status;

    const orderItems = await prisma.orderItem.findMany({
      where,
      include: {
        order: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            images: true,
          }
        },
        variant: {
          select: {
            id: true,
            name: true,
            value: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit),
    });

    const total = await prisma.orderItem.count({ where });

    res.json({
      orders: orderItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Get vendor orders error:', error);
    res.status(500).json({ message: 'Failed to get vendor orders' });
  }
});

module.exports = router;
