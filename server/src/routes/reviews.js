const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
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
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.review.count({
        where: { productId }
      })
    ]);

    // Get average rating
    const averageRating = await prisma.review.aggregate({
      where: { productId },
      _avg: {
        rating: true
      }
    });

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { productId },
      _count: {
        rating: true
      }
    });

    res.json({
      reviews,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      averageRating: averageRating._avg.rating || 0,
      ratingDistribution
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reviews by user
router.get('/user', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: { userId: req.user.id },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: {
                select: {
                  url: true
                },
                take: 1
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.review.count({
        where: { userId: req.user.id }
      })
    ]);

    res.json({
      reviews,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a review
router.post('/',
  authenticate,
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { productId, rating, comment } = req.body;

      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Check if user has already reviewed this product
      const existingReview = await prisma.review.findFirst({
        where: {
          userId: req.user.id,
          productId
        }
      });

      if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this product' });
      }

      // Check if user has purchased this product
      const hasPurchased = await prisma.orderItem.findFirst({
        where: {
          productId,
          order: {
            userId: req.user.id,
            status: 'DELIVERED'
          }
        }
      });

      if (!hasPurchased) {
        return res.status(400).json({ message: 'You can only review products you have purchased' });
      }

      const review = await prisma.review.create({
        data: {
          userId: req.user.id,
          productId,
          rating,
          comment
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

      res.status(201).json(review);
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update a review
router.put('/:id',
  authenticate,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { rating, comment } = req.body;

      const review = await prisma.review.findUnique({
        where: { id }
      });

      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      // Check if user owns this review
      if (review.userId !== req.user.id) {
        return res.status(403).json({ message: 'You can only edit your own reviews' });
      }

      const updatedReview = await prisma.review.update({
        where: { id },
        data: {
          rating,
          comment
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

      res.json(updatedReview);
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete a review
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns this review or is admin
    if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    await prisma.review.delete({
      where: { id }
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get review statistics for a product
router.get('/stats/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const [totalReviews, averageRating, ratingDistribution] = await Promise.all([
      prisma.review.count({
        where: { productId }
      }),
      prisma.review.aggregate({
        where: { productId },
        _avg: {
          rating: true
        }
      }),
      prisma.review.groupBy({
        by: ['rating'],
        where: { productId },
        _count: {
          rating: true
        }
      })
    ]);

    // Format rating distribution
    const distribution = {};
    for (let i = 1; i <= 5; i++) {
      distribution[i] = 0;
    }

    ratingDistribution.forEach(item => {
      distribution[item.rating] = item._count.rating;
    });

    res.json({
      totalReviews,
      averageRating: averageRating._avg.rating || 0,
      ratingDistribution: distribution
    });
  } catch (error) {
    console.error('Error fetching review statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
