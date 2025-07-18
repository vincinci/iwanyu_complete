const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadDocument } = require('../middleware/upload');
const FileService = require('../utils/fileService');

// Get all vendors (public)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const where = {
      isVerified: true
    };

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
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
              avatar: true
            }
          },
          products: {
            select: {
              id: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.vendor.count({ where })
    ]);

    const vendorsWithCounts = vendors.map(vendor => ({
      ...vendor,
      productCount: vendor.products.length,
      products: undefined
    }));

    res.json({
      vendors: vendorsWithCounts,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vendor by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true
          }
        },
        products: {
          where: { isActive: true },
          include: {
            images: true,
            category: true
          }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Don't return KYC documents to public
    const publicVendor = {
      ...vendor,
      kycDocument: undefined,
      taxDocument: undefined,
      licenseDocument: undefined
    };

    res.json(publicVendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Apply to become a vendor
router.post('/apply',
  authenticate,
  uploadDocument.fields([
    { name: 'kycDocument', maxCount: 1 },
    { name: 'taxDocument', maxCount: 1 },
    { name: 'licenseDocument', maxCount: 1 }
  ]),
  [
    body('businessName').notEmpty().withMessage('Business name is required'),
    body('businessAddress').notEmpty().withMessage('Business address is required'),
    body('businessPhone').notEmpty().withMessage('Business phone is required'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('taxId').optional().isLength({ max: 50 }).withMessage('Tax ID must be less than 50 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if user already has a vendor application
      const existingVendor = await prisma.vendor.findUnique({
        where: { userId: req.user.id }
      });

      if (existingVendor) {
        return res.status(400).json({ message: 'You already have a vendor application' });
      }

      const {
        businessName,
        businessAddress,
        businessPhone,
        description,
        taxId
      } = req.body;

      const vendorData = {
        userId: req.user.id,
        businessName,
        businessAddress,
        businessPhone,
        description,
        taxId,
        status: 'PENDING'
      };

      // Handle file uploads
      if (req.files) {
        if (req.files.kycDocument) {
          vendorData.kycDocument = req.files.kycDocument[0].filename;
        }
        if (req.files.taxDocument) {
          vendorData.taxDocument = req.files.taxDocument[0].filename;
        }
        if (req.files.licenseDocument) {
          vendorData.licenseDocument = req.files.licenseDocument[0].filename;
        }
      }

      const vendor = await prisma.vendor.create({
        data: vendorData,
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

      res.status(201).json(vendor);
    } catch (error) {
      console.error('Error creating vendor application:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get current user's vendor profile
router.get('/profile/me', authenticate, async (req, res) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        products: {
          include: {
            images: true,
            category: true
          }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    res.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update vendor profile
router.put('/profile',
  authenticate,
  uploadDocument.fields([
    { name: 'kycDocument', maxCount: 1 },
    { name: 'taxDocument', maxCount: 1 },
    { name: 'licenseDocument', maxCount: 1 }
  ]),
  [
    body('businessName').notEmpty().withMessage('Business name is required'),
    body('businessAddress').notEmpty().withMessage('Business address is required'),
    body('businessPhone').notEmpty().withMessage('Business phone is required'),
    body('businessEmail').isEmail().withMessage('Valid business email is required'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('businessType').notEmpty().withMessage('Business type is required'),
    body('taxId').notEmpty().withMessage('Tax ID is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const vendor = await prisma.vendor.findUnique({
        where: { userId: req.user.id }
      });

      if (!vendor) {
        return res.status(404).json({ message: 'Vendor profile not found' });
      }

      const {
        businessName,
        businessAddress,
        businessPhone,
        businessEmail,
        description,
        businessType,
        taxId
      } = req.body;

      const updateData = {
        businessName,
        businessAddress,
        businessPhone,
        businessEmail,
        description,
        businessType,
        taxId
      };

      // Handle file uploads
      if (req.files) {
        if (req.files.kycDocument) {
          if (vendor.kycDocument) {
            await FileService.deleteFile(`uploads/${vendor.kycDocument}`);
          }
          updateData.kycDocument = req.files.kycDocument[0].filename;
        }
        if (req.files.taxDocument) {
          if (vendor.taxDocument) {
            await FileService.deleteFile(`uploads/${vendor.taxDocument}`);
          }
          updateData.taxDocument = req.files.taxDocument[0].filename;
        }
        if (req.files.licenseDocument) {
          if (vendor.licenseDocument) {
            await FileService.deleteFile(`uploads/${vendor.licenseDocument}`);
          }
          updateData.licenseDocument = req.files.licenseDocument[0].filename;
        }
      }

      // If vendor was rejected and is being updated, set status back to pending
      if (vendor.status === 'REJECTED') {
        updateData.status = 'PENDING';
      }

      const updatedVendor = await prisma.vendor.update({
        where: { userId: req.user.id },
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

      res.json(updatedVendor);
    } catch (error) {
      console.error('Error updating vendor profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get vendor analytics
router.get('/analytics/dashboard', authenticate, async (req, res) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const [
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      recentOrders
    ] = await Promise.all([
      prisma.product.count({
        where: { vendorId: vendor.id }
      }),
      prisma.orderItem.count({
        where: { product: { vendorId: vendor.id } }
      }),
      prisma.orderItem.aggregate({
        where: { 
          product: { vendorId: vendor.id },
          order: { status: 'DELIVERED' }
        },
        _sum: {
          price: true
        }
      }),
      prisma.orderItem.count({
        where: { 
          product: { vendorId: vendor.id },
          order: { status: 'PENDING' }
        }
      }),
      prisma.orderItem.findMany({
        where: { product: { vendorId: vendor.id } },
        include: {
          order: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          product: {
            select: {
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
          order: {
            createdAt: 'desc'
          }
        },
        take: 5
      })
    ]);

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.price || 0,
      pendingOrders,
      recentOrders
    });
  } catch (error) {
    console.error('Error fetching vendor analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
