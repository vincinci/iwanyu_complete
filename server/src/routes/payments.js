const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const axios = require('axios');
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');

// Flutterwave configuration
const FLW_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FLW_PUBLIC_KEY = process.env.FLUTTERWAVE_PUBLIC_KEY;
const FLW_ENCRYPTION_KEY = process.env.FLUTTERWAVE_ENCRYPTION_KEY;

// Initialize payment
router.post('/initialize',
  authenticate,
  [
    body('orderId').notEmpty().withMessage('Order ID is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('currency').optional().isIn(['RWF', 'USD']).withMessage('Currency must be RWF or USD'),
    body('redirectUrl').optional().isURL().withMessage('Redirect URL must be valid')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { orderId, amount, currency = 'RWF', redirectUrl } = req.body;

      // Verify order exists and belongs to user
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true
        }
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (order.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      if (order.status !== 'PENDING') {
        return res.status(400).json({ message: 'Order is not pending payment' });
      }

      // Generate transaction reference
      const txRef = `iwanyu_${orderId}_${Date.now()}`;

      // Prepare payment data
      const paymentData = {
        tx_ref: txRef,
        amount: amount,
        currency: currency,
        redirect_url: redirectUrl || `${process.env.FRONTEND_URL}/order-confirmation/${orderId}`,
        payment_options: "card,mobilemoney,ussd,banktransfer",
        customer: {
          email: order.user.email,
          phonenumber: order.user.phone || '',
          name: `${order.user.firstName} ${order.user.lastName}`
        },
        customizations: {
          title: "Iwanyu Payment",
          description: `Payment for order ${orderId}`,
          logo: "https://iwanyu.com/logo.png"
        },
        meta: {
          order_id: orderId,
          user_id: req.user.id
        }
      };

      // Make request to Flutterwave
      const response = await axios.post(
        'https://api.flutterwave.com/v3/payments',
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${FLW_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        // Save payment record
        await prisma.payment.create({
          data: {
            orderId,
            userId: req.user.id,
            amount: parseFloat(amount),
            currency,
            provider: 'FLUTTERWAVE',
            transactionRef: txRef,
            status: 'PENDING'
          }
        });

        res.json({
          status: 'success',
          message: 'Payment initialized successfully',
          data: {
            link: response.data.data.link,
            tx_ref: txRef
          }
        });
      } else {
        res.status(400).json({
          status: 'error',
          message: 'Failed to initialize payment',
          data: response.data
        });
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Verify payment
router.post('/verify',
  authenticate,
  [
    body('tx_ref').notEmpty().withMessage('Transaction reference is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { tx_ref } = req.body;

      // Verify transaction with Flutterwave
      const response = await axios.get(
        `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`,
        {
          headers: {
            'Authorization': `Bearer ${FLW_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        const transactionData = response.data.data;
        
        // Find payment record
        const payment = await prisma.payment.findFirst({
          where: { transactionRef: tx_ref },
          include: {
            order: true
          }
        });

        if (!payment) {
          return res.status(404).json({ message: 'Payment record not found' });
        }

        // Verify payment belongs to user
        if (payment.userId !== req.user.id) {
          return res.status(403).json({ message: 'Access denied' });
        }

        // Check if transaction was successful
        if (transactionData.status === 'successful' && transactionData.amount >= payment.amount) {
          // Update payment status
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'COMPLETED',
              transactionId: transactionData.id.toString(),
              paidAt: new Date()
            }
          });

          // Update order status
          await prisma.order.update({
            where: { id: payment.orderId },
            data: {
              status: 'PROCESSING',
              paidAt: new Date()
            }
          });

          res.json({
            status: 'success',
            message: 'Payment verified successfully',
            data: {
              transaction_id: transactionData.id,
              amount: transactionData.amount,
              currency: transactionData.currency,
              status: transactionData.status
            }
          });
        } else {
          // Update payment status to failed
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'FAILED'
            }
          });

          res.status(400).json({
            status: 'error',
            message: 'Payment verification failed',
            data: transactionData
          });
        }
      } else {
        res.status(400).json({
          status: 'error',
          message: 'Failed to verify payment',
          data: response.data
        });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Flutterwave webhook
router.post('/webhook', async (req, res) => {
  try {
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    const signature = req.headers['verif-hash'];

    if (!signature || signature !== secretHash) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const payload = req.body;
    
    if (payload.event === 'charge.completed') {
      const { tx_ref, status, amount, currency } = payload.data;
      
      // Find payment record
      const payment = await prisma.payment.findFirst({
        where: { transactionRef: tx_ref }
      });

      if (payment && status === 'successful') {
        // Update payment status
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            transactionId: payload.data.id.toString(),
            paidAt: new Date()
          }
        });

        // Update order status
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            status: 'PROCESSING',
            paidAt: new Date()
          }
        });

        console.log(`Payment completed for order ${payment.orderId}`);
      }
    }

    res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment history
router.get('/history', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [payments, totalCount] = await Promise.all([
      prisma.payment.findMany({
        where: { userId: req.user.id },
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      name: true,
                      images: {
                        select: { url: true },
                        take: 1
                      }
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.payment.count({
        where: { userId: req.user.id }
      })
    ]);

    res.json({
      payments,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    images: {
                      select: { url: true },
                      take: 1
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refund payment (Admin only)
router.post('/:id/refund',
  authenticate,
  [
    body('reason').notEmpty().withMessage('Refund reason is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if user is admin
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }

      const { id } = req.params;
      const { reason } = req.body;

      const payment = await prisma.payment.findUnique({
        where: { id },
        include: { order: true }
      });

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      if (payment.status !== 'COMPLETED') {
        return res.status(400).json({ message: 'Only completed payments can be refunded' });
      }

      // Process refund with Flutterwave
      const refundData = {
        id: payment.transactionId,
        amount: payment.amount
      };

      const response = await axios.post(
        'https://api.flutterwave.com/v3/transactions/refund',
        refundData,
        {
          headers: {
            'Authorization': `Bearer ${FLW_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        // Update payment status
        await prisma.payment.update({
          where: { id },
          data: {
            status: 'REFUNDED',
            refundReason: reason,
            refundedAt: new Date()
          }
        });

        // Update order status
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            status: 'REFUNDED'
          }
        });

        res.json({
          status: 'success',
          message: 'Refund processed successfully',
          data: response.data.data
        });
      } else {
        res.status(400).json({
          status: 'error',
          message: 'Failed to process refund',
          data: response.data
        });
      }
    } catch (error) {
      console.error('Refund error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
