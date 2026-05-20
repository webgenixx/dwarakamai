import express from 'express';
import { body, validationResult } from 'express-validator';
import Service from '../models/Service.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const router = express.Router();

// Get all services (public)
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 }).lean();
    res.json({ services: services.map(s => ({ ...s, id: s._id })) });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Get single service (public)
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).lean();
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json({ ...service, id: service._id });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// Create service (admin only)
router.post('/', authenticate, isAdmin, upload.single('image'),
  [body('name').trim().notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, slug, description, price_range, is_active = true } = req.body;

      let image_url = null;
      let image_public_id = null;
      if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file, 'services');
        image_url = uploadResult.url;
        image_public_id = uploadResult.publicId;
      }

      const service = await Service.create({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
        price_range,
        image_url,
        image_public_id,
        is_active: is_active === true || is_active === 'true',
      });

      res.status(201).json({ message: 'Service created successfully', service });
    } catch (error) {
      console.error('Create service error:', error);
      res.status(500).json({ error: 'Failed to create service' });
    }
  }
);

// Update service (admin only)
router.put('/:id', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Service.findById(id);
    if (!existing) return res.status(404).json({ error: 'Service not found' });

    const { name, description, price_range, is_active } = req.body;

    let image_url = existing.image_url;
    let image_public_id = existing.image_public_id;

    if (req.file) {
      if (image_public_id) await deleteFromCloudinary(image_public_id);
      const uploadResult = await uploadToCloudinary(req.file, 'services');
      image_url = uploadResult.url;
      image_public_id = uploadResult.publicId;
    }

    const updates = {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(price_range !== undefined && { price_range }),
      image_url,
      image_public_id,
      ...(is_active !== undefined && { is_active: is_active === true || is_active === 'true' }),
    };

    const service = await Service.findByIdAndUpdate(id, updates, { new: true });
    res.json({ message: 'Service updated successfully', service });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Delete service (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    if (service.image_public_id) await deleteFromCloudinary(service.image_public_id);
    await Service.findByIdAndDelete(req.params.id);

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

export default router;
