const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');
const FileService = require('../utils/fileService');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const categoriesWithCounts = categories.map(category => ({
      ...category,
      productCount: category.products.length,
      products: undefined
    }));

    res.json(categoriesWithCounts);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            images: true,
            vendor: {
              select: {
                id: true,
                businessName: true,
                isVerified: true
              }
            }
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new category (Admin only)
router.post('/', 
  authenticate, 
  uploadImage.single('image'),
  [
    body('name').notEmpty().withMessage('Category name is required'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters')
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

      const { name, description } = req.body;

      // Check if category already exists
      const existingCategory = await prisma.category.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } }
      });

      if (existingCategory) {
        return res.status(400).json({ message: 'Category already exists' });
      }

      const categoryData = {
        name,
        description,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      };

      if (req.file) {
        categoryData.image = req.file.filename;
      }

      const category = await prisma.category.create({
        data: categoryData
      });

      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update category (Admin only)
router.put('/:id',
  authenticate,
  uploadImage.single('image'),
  [
    body('name').notEmpty().withMessage('Category name is required'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters')
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
      const { name, description } = req.body;

      const existingCategory = await prisma.category.findUnique({
        where: { id }
      });

      if (!existingCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // Check if another category with the same name exists
      const duplicateCategory = await prisma.category.findFirst({
        where: { 
          name: { equals: name, mode: 'insensitive' },
          id: { not: id }
        }
      });

      if (duplicateCategory) {
        return res.status(400).json({ message: 'Category name already exists' });
      }

      const updateData = {
        name,
        description,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      };

      if (req.file) {
        // Delete old image if exists
        if (existingCategory.image) {
          await FileService.deleteFile(`uploads/${existingCategory.image}`);
        }
        updateData.image = req.file.filename;
      }

      const updatedCategory = await prisma.category.update({
        where: { id },
        data: updateData
      });

      res.json(updatedCategory);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete category (Admin only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: true
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has products
    if (category.products.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with products. Please reassign products first.' 
      });
    }

    // Delete category image if exists
    if (category.image) {
      await FileService.deleteFile(`uploads/${category.image}`);
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
