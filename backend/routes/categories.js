import express from 'express';
import Category from '../models/Category.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.js';

const router = express.Router();

// Get all categories (public)
router.get('/', cacheMiddleware(300), async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    res.json({ categories: categories.map(c => ({ ...c, id: c._id })) });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create category (admin only)
router.post('/', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, slug, icon, is_occasion, occasion_order } = req.body;
    let image_url = null;
    let image_public_id = null;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file, 'categories');
      image_url = uploadResult.url;
      image_public_id = uploadResult.publicId;
    }

    const category = await Category.create({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      icon,
      image_url,
      image_public_id,
      is_occasion: is_occasion === 'true' || is_occasion === true,
      occasion_order: Number(occasion_order) || 0,
    });

    invalidateCache((key) => key.startsWith('/api/categories'));
    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category (admin only)
router.put('/:id', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, icon, is_occasion, occasion_order } = req.body;

    const existing = await Category.findById(id);
    if (!existing) return res.status(404).json({ error: 'Category not found' });

    const updates = {
      name: name || existing.name,
      slug: slug || existing.slug,
      icon: icon || existing.icon,
      is_occasion: is_occasion !== undefined ? (is_occasion === 'true' || is_occasion === true) : existing.is_occasion,
      occasion_order: occasion_order !== undefined ? Number(occasion_order) : existing.occasion_order,
    };

    if (req.file) {
      if (existing.image_public_id) {
        try { await deleteFromCloudinary(existing.image_public_id); } catch (e) {}
      }
      const uploadResult = await uploadToCloudinary(req.file, 'categories');
      updates.image_url = uploadResult.url;
      updates.image_public_id = uploadResult.publicId;
    }

    const category = await Category.findByIdAndUpdate(id, updates, { new: true });
    invalidateCache((key) => key.startsWith('/api/categories'));
    res.json({ message: 'Category updated successfully', category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (category?.image_public_id) {
      try { await deleteFromCloudinary(category.image_public_id); } catch (e) {}
    }
    await Category.findByIdAndDelete(id);
    invalidateCache((key) => key.startsWith('/api/categories'));
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
