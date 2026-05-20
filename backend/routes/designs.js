import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { authenticate, isAdmin } from '../middleware/auth.js';
import Order from '../models/Order.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendWhatsAppMessage } from '../config/whatsapp.js';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();

// Inline Design Approval Schema (no separate SQL table needed)
const designApprovalSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  order_item_id: { type: String, required: true }, // item._id string
  admin_designed_image: { type: String, default: null },
  status: {
    type: String,
    enum: ['pending_design', 'pending_approval', 'approved', 'revision_requested'],
    default: 'pending_design',
  },
  customer_feedback: { type: String, default: null },
  revision_count: { type: Number, default: 0 },
  approved_at: { type: Date, default: null },
}, { timestamps: true });

const DesignApproval = mongoose.models.DesignApproval || mongoose.model('DesignApproval', designApprovalSchema);

// Configure multer for design uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/designs/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'design-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpeg', '.jpg', '.png', '.gif', '.pdf'];
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    
    if (allowedExts.includes(ext) && allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  },
});

// Configure multer for customer customization uploads (memory storage for Cloudinary)
const memoryStorage = multer.memoryStorage();

const uploadCustomised = multer({
  storage: memoryStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpeg', '.jpg', '.png', '.gif'];
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    
    if (allowedExts.includes(ext) && allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Customer: Upload customization image to Cloudinary (NO AUTHENTICATION - for product customization before order)
router.post('/upload-customization', uploadCustomised.single('customizationImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    console.log('Starting Cloudinary upload for file:', req.file.originalname);

    // Upload to Cloudinary using Readable stream
    const result = await new Promise((resolve, reject) => {
      const stream = Readable.from(req.file.buffer);
      
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'dwarakamai/customised',
          resource_type: 'auto',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload successful:', result.public_id);
            resolve(result);
          }
        }
      );

      // Handle stream errors
      uploadStream.on('error', (error) => {
        console.error('Upload stream error:', error);
        reject(error);
      });

      // Pipe stream to upload
      stream.pipe(uploadStream);
    });

    res.json({ 
      success: true, 
      imageUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
      message: 'Customization image uploaded to Cloudinary successfully' 
    });
  } catch (error) {
    console.error('Error uploading customization image to Cloudinary:', error);
    res.status(500).json({ 
      error: 'Failed to upload customization image', 
      details: error.message || 'Unknown error' 
    });
  }
});

// Get design approval for an order item
router.get('/order-item/:orderItemId', authenticate, async (req, res) => {
  try {
    const design = await DesignApproval.findOne({ order_item_id: req.params.orderItemId }).lean();
    if (!design) return res.status(404).json({ error: 'Design approval not found' });
    res.json({ design });
  } catch (error) {
    console.error('Error fetching design approval:', error);
    res.status(500).json({ error: 'Failed to fetch design approval' });
  }
});

// Admin: Upload designed image
router.post('/upload/:orderItemId', authenticate, isAdmin, upload.single('design'), async (req, res) => {
  try {
    const { orderItemId } = req.params;
    const designImageUrl = `/uploads/designs/${req.file.filename}`;

    const design = await DesignApproval.findOneAndUpdate(
      { order_item_id: orderItemId },
      { admin_designed_image: designImageUrl, status: 'pending_approval' },
      { new: true, upsert: true }
    );

    // Create notification for the user
    console.log('[Design Upload Notification Debug] orderItemId string:', orderItemId);
    let order;
    try {
      if (mongoose.Types.ObjectId.isValid(orderItemId)) {
        order = await Order.findOne({ "items._id": new mongoose.Types.ObjectId(orderItemId) });
      } else {
        order = await Order.findOne({ "items._id": orderItemId });
      }
    } catch (e) {
      console.error('[Design Upload Notification Debug] Error searching order:', e);
    }
    console.log('[Design Upload Notification Debug] Order found:', order ? order.order_number : 'NOT FOUND');

    if (order) {
      console.log('[Design Upload Notification Debug] Searching user with email:', order.customer_email, 'or phone:', order.customer_phone);
      const user = await User.findOne({
        $or: [
          { email: order.customer_email },
          { phone: order.customer_phone }
        ]
      });
      console.log('[Design Upload Notification Debug] User found:', user ? user.name : 'NOT FOUND');

      if (user) {
        try {
          const notif = await Notification.create({
            user_id: user._id,
            title: 'Design Ready for Review',
            message: `Please review the custom design for your order ${order.order_number}.`,
            type: 'design',
            link: `/order/${order._id}`
          });
          console.log('[Design Upload Notification Debug] Notification created successfully:', notif._id);
        } catch (notifErr) {
          console.error('[Design Upload Notification Debug] Error creating Notification document:', notifErr);
        }
      } else {
        console.log('[Design Upload Notification Debug] Notification skipped because user was NOT found.');
      }

      if (order.customer_phone) {
        const frontendUrl = process.env.FRONTEND_URL || 'https://dwarakamaidigitalphotostudio.com';
        const waMessage = `🎨 Design Ready for Review!\n\nHi ${order.customer_name},\n\nWe have created the custom design for your order #${order.order_number}.\n\nPlease review and approve it here: ${frontendUrl}/order/${order._id}\n\nQuestions? Call us at +91 9492686421`;
        sendWhatsAppMessage(order.customer_phone, waMessage).catch(err => console.error('Failed to send WA design review:', err));
      }
    }

    res.json({ success: true, design, message: 'Design uploaded successfully' });
  } catch (error) {
    console.error('Error uploading design:', error);
    res.status(500).json({ error: 'Failed to upload design' });
  }
});

// Customer: Approve design
router.post('/approve/:orderItemId', authenticate, async (req, res) => {
  try {
    const design = await DesignApproval.findOneAndUpdate(
      { order_item_id: req.params.orderItemId },
      { status: 'approved', approved_at: new Date() },
      { new: true }
    );
    if (!design) return res.status(404).json({ error: 'Design not found' });
    res.json({ success: true, design, message: 'Design approved successfully' });
  } catch (error) {
    console.error('Error approving design:', error);
    res.status(500).json({ error: 'Failed to approve design' });
  }
});

// Customer: Request revision
router.post('/request-revision/:orderItemId', authenticate, async (req, res) => {
  try {
    const { feedback } = req.body;
    const design = await DesignApproval.findOneAndUpdate(
      { order_item_id: req.params.orderItemId },
      { status: 'revision_requested', customer_feedback: feedback, $inc: { revision_count: 1 } },
      { new: true }
    );
    if (!design) return res.status(404).json({ error: 'Design not found' });
    res.json({ success: true, design, message: 'Revision requested successfully' });
  } catch (error) {
    console.error('Error requesting revision:', error);
    res.status(500).json({ error: 'Failed to request revision' });
  }
});

// Get all pending designs (Admin)
router.get('/pending', authenticate, isAdmin, async (req, res) => {
  try {
    const designs = await DesignApproval.find({
      status: { $in: ['pending_design', 'revision_requested'] },
    }).sort({ createdAt: -1 }).lean();

    res.json({ designs: designs.map(d => ({ ...d, id: d._id })) });
  } catch (error) {
    console.error('Error fetching pending designs:', error);
    res.status(500).json({ error: 'Failed to fetch pending designs' });
  }
});

export default router;
