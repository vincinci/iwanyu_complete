const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');
const FileService = require('../utils/fileService');

// Middleware to ensure admin access
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Get admin dashboard statistics
router.get('/dashboard', authenticate, adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingVendors,
      recentOrders,
      topProducts,
      monthlyStats
    ] = await Promise.all([
      prisma.user.count(),
      prisma.vendor.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: 'DELIVERED' },
        _sum: { total: true }
      }),
      prisma.vendor.count({
        where: { status: 'PENDING' }
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _count: { productId: true },
        _sum: { quantity: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 10
      }),
      prisma.order.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        _sum: { total: true },
        orderBy: { createdAt: 'desc' },
        take: 12
      })
    ]);

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            price: true,
            images: {
              select: { url: true },
              take: 1
            }
          }
        });
        return {
          ...product,
          totalSold: item._sum.quantity,
          orderCount: item._count.productId
        };
      })
    );

    res.json({
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingVendors,
      recentOrders,
      topProducts: topProductsWithDetails,
      monthlyStats
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', authenticate, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role || '';

    const where = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (role) {
      where.role = role;
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          avatar: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle user active status
router.put('/users/:id/toggle-status', authenticate, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all vendor applications
router.get('/vendors', authenticate, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || '';

    const where = {};
    if (status) {
      where.status = status;
    }

    const [vendors, totalCount] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.vendor.count({ where })
    ]);

    res.json({
      vendors,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Error fetching vendor applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/Reject vendor application
router.put('/vendors/:id/status',
  authenticate,
  adminAuth,
  [
    body('status').isIn(['APPROVED', 'REJECTED']).withMessage('Status must be APPROVED or REJECTED'),
    body('rejectionReason').optional().isLength({ max: 500 }).withMessage('Rejection reason must be less than 500 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { status, rejectionReason } = req.body;

      const vendor = await prisma.vendor.findUnique({
        where: { id },
        include: {
          user: true
        }
      });

      if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found' });
      }

      const updateData = {
        status
      };

      const updatedVendor = await prisma.vendor.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      // Update user role if approved
      if (status === 'APPROVED') {
        await prisma.user.update({
          where: { id: vendor.userId },
          data: { role: 'VENDOR' }
        });
      }

      res.json(updatedVendor);
    } catch (error) {
      console.error('Error updating vendor status:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get all products
router.get('/products', authenticate, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const vendor = req.query.vendor || '';

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (category) {
      where.categoryId = category;
    }
    if (vendor) {
      where.vendorId = vendor;
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          vendor: {
            select: {
              id: true,
              businessName: true
            }
          },
          images: {
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle product active status
router.put('/products/:id/toggle-status', authenticate, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
      include: {
        category: true,
        vendor: {
          select: {
            id: true,
            businessName: true
          }
        },
        images: {
          take: 1
        }
      }
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error toggling product status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders
router.get('/orders', authenticate, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || '';

    const where = {};
    if (status) {
      where.status = status;
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: {
                    take: 1
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
      prisma.order.count({ where })
    ]);

    res.json({
      orders,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status
router.put('/orders/:id/status',
  authenticate,
  adminAuth,
  [
    body('status').isIn(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).withMessage('Invalid status')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { status } = req.body;

      const order = await prisma.order.findUnique({
        where: { id }
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: {
                    take: 1
                  }
                }
              }
            }
          }
        }
      });

      res.json(updatedOrder);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Create banner
router.post('/banners',
  authenticate,
  adminAuth,
  uploadImage.single('image'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('subtitle').optional().isLength({ max: 200 }).withMessage('Subtitle must be less than 200 characters'),
    body('buttonText').optional().isLength({ max: 50 }).withMessage('Button text must be less than 50 characters'),
    body('buttonUrl').optional().isURL().withMessage('Button URL must be valid'),
    body('position').isIn(['HERO', 'SECONDARY', 'PROMOTIONAL']).withMessage('Invalid position')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, subtitle, buttonText, buttonUrl, position } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: 'Banner image is required' });
      }

      const banner = await prisma.banner.create({
        data: {
          title,
          subtitle,
          buttonText,
          buttonUrl,
          position,
          image: req.file.filename,
          isActive: true
        }
      });

      res.status(201).json(banner);
    } catch (error) {
      console.error('Error creating banner:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get all banners
router.get('/banners', authenticate, adminAuth, async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update banner
router.put('/banners/:id',
  authenticate,
  adminAuth,
  uploadImage.single('image'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('subtitle').optional().isLength({ max: 200 }).withMessage('Subtitle must be less than 200 characters'),
    body('buttonText').optional().isLength({ max: 50 }).withMessage('Button text must be less than 50 characters'),
    body('buttonUrl').optional().isURL().withMessage('Button URL must be valid'),
    body('position').isIn(['HERO', 'SECONDARY', 'PROMOTIONAL']).withMessage('Invalid position')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { title, subtitle, buttonText, buttonUrl, position } = req.body;

      const banner = await prisma.banner.findUnique({
        where: { id }
      });

      if (!banner) {
        return res.status(404).json({ message: 'Banner not found' });
      }

      const updateData = {
        title,
        subtitle,
        buttonText,
        buttonUrl,
        position
      };

      if (req.file) {
        // Delete old image
        if (banner.image) {
          await FileService.deleteFile(`uploads/${banner.image}`);
        }
        updateData.image = req.file.filename;
      }

      const updatedBanner = await prisma.banner.update({
        where: { id },
        data: updateData
      });

      res.json(updatedBanner);
    } catch (error) {
      console.error('Error updating banner:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Toggle banner active status
router.put('/banners/:id/toggle-status', authenticate, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await prisma.banner.findUnique({
      where: { id }
    });

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    const updatedBanner = await prisma.banner.update({
      where: { id },
      data: { isActive: !banner.isActive }
    });

    res.json(updatedBanner);
  } catch (error) {
    console.error('Error toggling banner status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete banner
router.delete('/banners/:id', authenticate, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await prisma.banner.findUnique({
      where: { id }
    });

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    // Delete banner image
    if (banner.image) {
      await FileService.deleteFile(`uploads/${banner.image}`);
    }

    await prisma.banner.delete({
      where: { id }
    });

    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
