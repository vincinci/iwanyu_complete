const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');

// Get user's conversations
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { buyerId: req.user.id },
          { sellerId: req.user.id }
        ]
      },
      include: {
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: {
              select: {
                url: true
              },
              take: 1
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get conversation by ID
router.get('/conversations/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: {
              select: {
                url: true
              },
              take: 1
            }
          }
        },
        messages: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is part of the conversation
    if (conversation.buyerId !== req.user.id && conversation.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or get conversation
router.post('/conversations',
  authenticate,
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('sellerId').notEmpty().withMessage('Seller ID is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { productId, sellerId } = req.body;

      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Check if seller exists
      const seller = await prisma.user.findUnique({
        where: { id: sellerId }
      });

      if (!seller) {
        return res.status(404).json({ message: 'Seller not found' });
      }

      // Check if conversation already exists
      let conversation = await prisma.conversation.findFirst({
        where: {
          buyerId: req.user.id,
          sellerId,
          productId
        },
        include: {
          buyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: {
                select: {
                  url: true
                },
                take: 1
              }
            }
          }
        }
      });

      if (!conversation) {
        // Create new conversation
        conversation = await prisma.conversation.create({
          data: {
            buyerId: req.user.id,
            sellerId,
            productId
          },
          include: {
            buyer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            seller: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: {
                  select: {
                    url: true
                  },
                  take: 1
                }
              }
            }
          }
        });
      }

      res.json(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Send message
router.post('/messages',
  authenticate,
  [
    body('conversationId').notEmpty().withMessage('Conversation ID is required'),
    body('content').notEmpty().withMessage('Message content is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { conversationId, content } = req.body;

      // Check if conversation exists and user is part of it
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
      });

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      if (conversation.buyerId !== req.user.id && conversation.sellerId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Create message
      const message = await prisma.message.create({
        data: {
          conversationId,
          userId: req.user.id,
          content
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        }
      });

      // Update conversation's updatedAt
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      });

      res.status(201).json(message);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Mark messages as read
router.put('/messages/:conversationId/read', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Check if conversation exists and user is part of it
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.buyerId !== req.user.id && conversation.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        userId: { not: req.user.id },
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread message count
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const unreadCount = await prisma.message.count({
      where: {
        conversation: {
          OR: [
            { buyerId: req.user.id },
            { sellerId: req.user.id }
          ]
        },
        userId: { not: req.user.id },
        isRead: false
      }
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
