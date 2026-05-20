import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { authenticate, isSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all admins (super admin only)
router.get('/admins', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } })
      .select('-password')
      .sort({ role: 1, createdAt: -1 })
      .lean();

    res.json({ admins: admins.map(a => ({ ...a, id: a._id })), count: admins.length });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

// Create new admin
router.post('/admins', authenticate, isSuperAdmin,
  [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['admin', 'super_admin']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, email, password, role, phone } = req.body;
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ error: 'Email already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = await User.create({ name, email, password: hashedPassword, role, phone: phone || null });

      res.status(201).json({
        message: 'Admin created successfully',
        admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role, phone: admin.phone },
      });
    } catch (error) {
      console.error('Create admin error:', error);
      res.status(500).json({ error: 'Failed to create admin' });
    }
  }
);

// Update admin
router.put('/admins/:id', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone, password } = req.body;

    if (id === req.user.id && role && role !== 'super_admin') {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const existing = await User.findOne({ _id: id, role: { $in: ['admin', 'super_admin'] } });
    if (!existing) return res.status(404).json({ error: 'Admin not found' });

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (phone !== undefined) updates.phone = phone;
    if (password) updates.password = await bcrypt.hash(password, 10);

    const admin = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    res.json({ message: 'Admin updated successfully', admin });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ error: 'Failed to update admin' });
  }
});

// Delete admin
router.delete('/admins/:id', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) return res.status(400).json({ error: 'Cannot delete your own account' });

    const existing = await User.findOne({ _id: id, role: { $in: ['admin', 'super_admin'] } });
    if (!existing) return res.status(404).json({ error: 'Admin not found' });

    await User.findByIdAndDelete(id);
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ error: 'Failed to delete admin' });
  }
});

// Get system statistics
router.get('/stats', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const [
      total_customers, total_admins, total_super_admins,
      total_products, total_orders, total_categories, revenueAgg
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'super_admin' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Category.countDocuments(),
      Order.aggregate([{ $match: { payment_status: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    ]);

    res.json({
      total_customers,
      total_admins,
      total_super_admins,
      total_products,
      total_orders,
      total_categories,
      total_revenue: revenueAgg[0]?.total || 0,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get all users
router.get('/users', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const { role, search, limit = 50, offset = 0 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit))
      .lean();

    res.json({ users: users.map(u => ({ ...u, id: u._id })), count: users.length });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
