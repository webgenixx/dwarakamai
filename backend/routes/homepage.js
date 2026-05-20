import express from 'express';
import HomepageContent from '../models/HomepageContent.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { logAdminAction } from '../middleware/auditLog.js';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.js';

const router = express.Router();

// Get all active homepage content (public)
router.get('/content', cacheMiddleware(60), async (req, res) => {
  try {
    const items = await HomepageContent.find({ is_active: true })
      .sort({ content_type: 1, display_order: 1 })
      .lean();

    const grouped = {
      hero_banner: items.find((c) => c.content_type === 'banner'),
      offers: items.filter((c) => c.content_type === 'offer_card'),
      testimonials: items.filter((c) => c.content_type === 'testimonial'),
    };

    res.json({ success: true, content: grouped });
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch homepage content' });
  }
});

// Get all homepage content for admin (includes inactive)
router.get('/admin/content', authenticate, isAdmin, async (req, res) => {
  try {
    const content = await HomepageContent.find().sort({ content_type: 1, display_order: 1 }).lean();
    res.json({ success: true, content: content.map(c => ({ ...c, id: c._id })) });
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch homepage content' });
  }
});

// Get single content item
router.get('/admin/content/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const content = await HomepageContent.findById(req.params.id).lean();
    if (!content) return res.status(404).json({ success: false, message: 'Content not found' });
    res.json({ success: true, content: { ...content, id: content._id } });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch content' });
  }
});

// Update homepage content
router.put('/admin/content/:id', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await HomepageContent.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Content not found' });

    const { title, description, link_url, display_order, is_active } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (link_url !== undefined) updates.link_url = link_url;
    if (display_order !== undefined) updates.display_order = Number(display_order);
    if (is_active !== undefined) updates.is_active = is_active === 'true' || is_active === true;
    if (req.file) updates.image_url = `/uploads/${req.file.filename}`;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const content = await HomepageContent.findByIdAndUpdate(id, updates, { new: true });

    await logAdminAction(req, 'UPDATE', 'homepage_content', id, existing.section);
    invalidateCache((key) => key.includes('/api/homepage/content'));

    res.json({ success: true, message: 'Content updated successfully', content });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ success: false, message: 'Failed to update content' });
  }
});

// Create new homepage content
router.post('/admin/content', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { section, content_type, title, description, link_url, display_order } = req.body;
    if (!section || !content_type) {
      return res.status(400).json({ success: false, message: 'Section and content type are required' });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const content = await HomepageContent.create({
      section, content_type, title, description, image_url, link_url,
      display_order: display_order || 0,
    });

    await logAdminAction(req, 'CREATE', 'homepage_content', content._id, section);
    res.status(201).json({ success: true, message: 'Content created successfully', content });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ success: false, message: 'Failed to create content' });
  }
});

// Delete homepage content
router.delete('/admin/content/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const existing = await HomepageContent.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Content not found' });

    await HomepageContent.findByIdAndDelete(req.params.id);
    await logAdminAction(req, 'DELETE', 'homepage_content', req.params.id, existing.section);
    invalidateCache((key) => key.includes('/api/homepage/content'));

    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ success: false, message: 'Failed to delete content' });
  }
});

export default router;
