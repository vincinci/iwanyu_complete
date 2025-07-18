const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');
const FileService = require('../utils/fileService');

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const vendor = req.query.vendor || '';
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || 999999;
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order || 'desc';

    const where = {
      isActive: true,
      stock: { gt: 0 },
      price: {
        gte: minPrice,
        lte: maxPrice
      }
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
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
              businessName: true,
              status: true
            }
          },
          variants: true,
          reviews: {
            select: {
              rating: true
            }
          }
        },
        orderBy: { [sort]: order },
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    // Calculate average rating for each product
    const productsWithRatings = products.map(product => {
      const ratings = product.reviews.map(review => review.rating);
      const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;
      
      return {
        ...product,
        averageRating: parseFloat(averageRating.toFixed(1)),
        reviewCount: ratings.length,
        reviews: undefined // Remove reviews from response
      };
    });

    res.json({
      products: productsWithRatings,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product by ID or slug
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is a valid UUID (ID) or slug
    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    
    const product = await prisma.product.findUnique({
      where: isId ? { id: identifier } : { slug: identifier },
      include: {
        category: true,
        vendor: {
          select: {
            id: true,
            businessName: true,
            businessAddress: true,
            businessPhone: true,
            status: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        variants: true,
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Calculate average rating
    const ratings = product.reviews.map(review => review.rating);
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;

    // Get related products
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
        stock: { gt: 0 }
      },
      include: {
        vendor: {
          select: {
            businessName: true,
            status: true
          }
        }
      },
      take: 4
    });

    res.json({
      ...product,
      averageRating: parseFloat(averageRating.toFixed(1)),
      reviewCount: ratings.length,
      relatedProducts
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new product (Vendor only)
router.post('/',
  authenticate,
  uploadImage.array('images', 5),
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('categoryId').notEmpty().withMessage('Category is required'),
    body('tags').optional().isArray().withMessage('Tags must be an array')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if user is a vendor
      const vendor = await prisma.vendor.findUnique({
        where: { userId: req.user.id }
      });

      if (!vendor || vendor.status !== 'APPROVED') {
        return res.status(403).json({ message: 'Access denied. Verified vendor required.' });
      }

      const { name, description, price, stock, categoryId, tags, variants, sku } = req.body;

      // Create slug from name
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Check if slug already exists
      const existingProduct = await prisma.product.findFirst({
        where: { slug }
      });

      let finalSlug = slug;
      if (existingProduct) {
        finalSlug = `${slug}-${Date.now()}`;
      }

      // Create product
      const product = await prisma.product.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          stock: parseInt(stock),
          categoryId,
          vendorId: vendor.id,
          slug: finalSlug,
          sku: sku || finalSlug,
          tags: tags || [],
          isActive: true
        }
      });

      // Handle image uploads
      if (req.files && req.files.length > 0) {
        const imageData = req.files.map((file, index) => ({
          productId: product.id,
          url: file.filename,
          altText: `${name} image ${index + 1}`,
          isPrimary: index === 0
        }));

        await prisma.productImage.createMany({
          data: imageData
        });
      }

      // Handle variants
      if (variants && Array.isArray(variants)) {
        const variantData = variants.map(variant => ({
          productId: product.id,
          name: variant.name,
          value: variant.value,
          price: parseFloat(variant.price) || 0,
          stock: parseInt(variant.stock) || 0
        }));

        await prisma.productVariant.createMany({
          data: variantData
        });
      }

      // Fetch complete product data
      const createdProduct = await prisma.product.findUnique({
        where: { id: product.id },
        include: {
          category: true,
          vendor: {
            select: {
              id: true,
              businessName: true
            }
          },
          variants: true
        }
      });

      res.status(201).json(createdProduct);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update product (Vendor only - own products)
router.put('/:id',
  authenticate,
  uploadImage.array('images', 5),
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('categoryId').notEmpty().withMessage('Category is required'),
    body('tags').optional().isArray().withMessage('Tags must be an array')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { name, description, price, stock, categoryId, tags, variants, removeImages } = req.body;

      // Check if user is a vendor
      const vendor = await prisma.vendor.findUnique({
        where: { userId: req.user.id }
      });

      if (!vendor || vendor.status !== 'APPROVED') {
        return res.status(403).json({ message: 'Access denied. Verified vendor required.' });
      }

      // Check if product exists and belongs to vendor
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          variants: true
        }
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (product.vendorId !== vendor.id) {
        return res.status(403).json({ message: 'You can only edit your own products' });
      }

      // Update slug if name changed
      let slug = product.slug;
      if (name !== product.name) {
        slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        const existingProduct = await prisma.product.findFirst({
          where: { 
            slug,
            id: { not: id }
          }
        });

        if (existingProduct) {
          slug = `${slug}-${Date.now()}`;
        }
      }

      // Update product
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          name,
          description,
          price: parseFloat(price),
          stock: parseInt(stock),
          categoryId,
          slug,
          tags: tags || []
        }
      });

      // Handle image removal
      if (removeImages && Array.isArray(removeImages)) {
        const imagesToRemove = await prisma.productImage.findMany({
          where: {
            id: { in: removeImages },
            productId: id
          }
        });

        for (const image of imagesToRemove) {
          await FileService.deleteFile(`uploads/${image.url}`);
        }

        await prisma.productImage.deleteMany({
          where: {
            id: { in: removeImages }
          }
        });
      }

      // Handle new image uploads
      if (req.files && req.files.length > 0) {
        const imageData = req.files.map((file, index) => ({
          productId: id,
          url: file.filename,
          altText: `${name} image ${index + 1}`,
          isPrimary: product.images.length === 0 && index === 0
        }));

        await prisma.productImage.createMany({
          data: imageData
        });
      }

      // Handle variants update
      if (variants && Array.isArray(variants)) {
        // Delete existing variants
        await prisma.productVariant.deleteMany({
          where: { productId: id }
        });

        // Create new variants
        const variantData = variants.map(variant => ({
          productId: id,
          name: variant.name,
          value: variant.value,
          price: parseFloat(variant.price) || 0,
          stock: parseInt(variant.stock) || 0
        }));

        await prisma.productVariant.createMany({
          data: variantData
        });
      }

      // Fetch complete updated product data
      const finalProduct = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          vendor: {
            select: {
              id: true,
              businessName: true
            }
          },
          variants: true
        }
      });

      res.json(finalProduct);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete product (Vendor only - own products)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is a vendor
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id }
    });

    if (!vendor || vendor.status !== 'APPROVED') {
      return res.status(403).json({ message: 'Access denied. Verified vendor required.' });
    }

    // Check if product exists and belongs to vendor
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.vendorId !== vendor.id) {
      return res.status(403).json({ message: 'You can only delete your own products' });
    }

    // Check if product has pending orders
    const pendingOrders = await prisma.orderItem.findFirst({
      where: {
        productId: id,
        order: {
          status: { in: ['PENDING', 'PROCESSING'] }
        }
      }
    });

    if (pendingOrders) {
      return res.status(400).json({ 
        message: 'Cannot delete product with pending orders' 
      });
    }

    // Delete product images
    for (const image of product.images) {
      await FileService.deleteFile(`uploads/${image.url}`);
    }

    // Delete product (cascade will handle related records)
    await prisma.product.delete({
      where: { id }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vendor's products
router.get('/vendor/my-products', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if user is a vendor
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: { vendorId: vendor.id },
        include: {
          category: true,
          images: {
            take: 1
          },
          variants: true,
          reviews: {
            select: {
              rating: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.product.count({
        where: { vendorId: vendor.id }
      })
    ]);

    // Calculate average rating for each product
    const productsWithRatings = products.map(product => {
      const ratings = product.reviews.map(review => review.rating);
      const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;
      
      return {
        ...product,
        averageRating: parseFloat(averageRating.toFixed(1)),
        reviewCount: ratings.length,
        reviews: undefined
      };
    });

    res.json({
      products: productsWithRatings,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Error fetching vendor products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle product active status (Vendor only)
router.put('/:id/toggle-status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is a vendor
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id }
    });

    if (!vendor || vendor.status !== 'APPROVED') {
      return res.status(403).json({ message: 'Access denied. Verified vendor required.' });
    }

    // Check if product exists and belongs to vendor
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.vendorId !== vendor.id) {
      return res.status(403).json({ message: 'You can only modify your own products' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
      include: {
        category: true,
        images: {
          take: 1
        },
        variants: true
      }
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error toggling product status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured products
router.get('/featured/list', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: { gt: 0 },
        vendor: {
          status: 'APPROVED'
        }
      },
      include: {
        category: true,
        vendor: {
          select: {
            businessName: true,
            status: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 8
    });

    // Calculate average rating for each product
    const productsWithRatings = products.map(product => {
      const ratings = product.reviews.map(review => review.rating);
      const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;
      
      return {
        ...product,
        averageRating: parseFloat(averageRating.toFixed(1)),
        reviewCount: ratings.length,
        reviews: undefined
      };
    });

    res.json(productsWithRatings);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
