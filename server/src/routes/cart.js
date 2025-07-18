const express = require('express');
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Get cart
router.get('/', authenticate, async (req, res) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            vendor: {
              select: {
                id: true,
                businessName: true,
              }
            }
          }
        },
        variant: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ items });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Failed to get cart' });
  }
});

// Add to cart
router.post('/', authenticate, async (req, res) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;

    // Check if item already exists
    let existingItem;
    if (variantId) {
      existingItem = await prisma.cartItem.findUnique({
        where: {
          userId_productId_variantId: {
            userId: req.user.id,
            productId,
            variantId,
          }
        }
      });
    } else {
      existingItem = await prisma.cartItem.findFirst({
        where: {
          userId: req.user.id,
          productId,
          variantId: null,
        }
      });
    }

    if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      // Create new item
      await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId,
          variantId: variantId || null,
          quantity,
        }
      });
    }

    res.status(201).json({ message: 'Item added to cart' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Failed to add to cart' });
  }
});

// Update cart item
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { quantity } = req.body;

    await prisma.cartItem.update({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      },
      data: { quantity }
    });

    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            vendor: {
              select: {
                id: true,
                businessName: true,
              }
            }
          }
        },
        variant: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ items });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Failed to update cart' });
  }
});

// Remove from cart
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.cartItem.delete({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      }
    });

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Failed to remove from cart' });
  }
});

// Clear cart
router.delete('/', authenticate, async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id }
    });

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Failed to clear cart' });
  }
});

module.exports = router;
