import express from 'express';
import Gallery from '../models/Gallery.js';
import AuditLog from '../models/AuditLog.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const router = express.Router();

// Get all gallery images (public)
router.get('/', async (req, res) => {
  try {
    const { category, limit = 50 } = req.query;
    const filter = {};
    if (category) filter.category = category;

    const images = await Gallery.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    res.json({ images: images.map(i => ({ ...i, id: i._id })) });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery images' });
  }
});

// Upload gallery image (admin only)
router.post('/', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category = 'general' } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Image file is required' });

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file, 'gallery');

    const image = await Gallery.create({
      title,
      description,
      image_url: uploadResult.url,
      image_public_id: uploadResult.publicId,
      category,
      uploaded_by: req.user?.id,
    });

    await AuditLog.create({
      admin_id: req.user?.id,
      admin_email: req.user?.email,
      admin_name: req.user?.name,
      action: 'create',
      entity_type: 'gallery',
      entity_id: String(image._id),
      entity_name: title,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
    }).catch(() => {});

    res.status(201).json({ message: 'Image uploaded successfully', image });
  } catch (error) {
    console.error('Upload gallery image error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Update gallery image (admin only)
router.put('/:id', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const existing = await Gallery.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Image not found' });

    let imageUrl = existing.image_url;
    let imagePublicId = existing.image_public_id;

    if (req.file) {
      // Delete old image if it exists
      if (imagePublicId) await deleteFromCloudinary(imagePublicId);
      // Upload new image
      const uploadResult = await uploadToCloudinary(req.file, 'gallery');
      imageUrl = uploadResult.url;
      imagePublicId = uploadResult.publicId;
    }

    const image = await Gallery.findByIdAndUpdate(
      req.params.id,
      { 
        ...(title && { title }), 
        ...(description !== undefined && { description }), 
        ...(category && { category }),
        image_url: imageUrl,
        image_public_id: imagePublicId
      },
      { new: true }
    );

    res.json({ message: 'Image updated successfully', image });
  } catch (error) {
    console.error('Update gallery image error:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

// Delete gallery image (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) return res.status(404).json({ error: 'Image not found' });

    // Delete from Cloudinary if publicId exists
    if (image.image_public_id) {
      await deleteFromCloudinary(image.image_public_id);
    }

    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete gallery image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

export default router;
