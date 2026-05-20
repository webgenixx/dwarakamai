import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { logAdminAction, getChanges } from '../middleware/auditLog.js';

const router = express.Router();
router.use(authenticate, isAdmin);

// Dashboard Statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      total_orders,
      pending_orders,
      completed_orders,
      total_products,
      total_customers,
      revenueAgg,
      monthlyRevenueAgg,
      dailyRevenueAgg,
    ] = await Promise.all([
      Order.countDocuments({ payment_status: 'paid' }),
      Order.countDocuments({ order_status: 'pending' }),
      Order.countDocuments({ order_status: 'completed' }),
      Product.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.aggregate([{ $match: { payment_status: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([
        { $match: { payment_status: 'paid', createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { payment_status: 'paid', createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    res.json({
      total_orders,
      pending_orders,
      completed_orders,
      total_products,
      total_customers,
      total_revenue: revenueAgg[0]?.total || 0,
      monthly_revenue: monthlyRevenueAgg[0]?.total || 0,
      daily_revenue: dailyRevenueAgg[0]?.total || 0,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Sales Report
router.get('/sales-report', async (req, res) => {
  try {
    const { start_date, end_date, group_by = 'day' } = req.query;

    const match = { payment_status: 'paid' };
    if (start_date || end_date) {
      match.createdAt = {};
      if (start_date) match.createdAt.$gte = new Date(start_date);
      if (end_date) match.createdAt.$lte = new Date(end_date);
    }

    const groupFormat = group_by === 'month'
      ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }
      : group_by === 'week'
        ? { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } }
        : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };

    const result = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupFormat,
          order_count: { $sum: 1 },
          total_sales: { $sum: '$total' },
          average_order_value: { $avg: '$total' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
    ]);

    const report = result.map((r) => ({
      period: group_by === 'month'
        ? `${r._id.year}-${String(r._id.month).padStart(2, '0')}`
        : group_by === 'week'
          ? `${r._id.year}-W${String(r._id.week).padStart(2, '0')}`
          : `${r._id.year}-${String(r._id.month).padStart(2, '0')}-${String(r._id.day).padStart(2, '0')}`,
      order_count: r.order_count,
      total_sales: r.total_sales,
      average_order_value: r.average_order_value,
    }));

    res.json({
      report,
      summary: {
        total_orders: report.reduce((s, r) => s + r.order_count, 0),
        total_sales: report.reduce((s, r) => s + r.total_sales, 0),
      },
    });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ error: 'Failed to generate sales report' });
  }
});

// Top Products
router.get('/top-products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const result = await Order.aggregate([
      { $match: { payment_status: 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product_id',
          product_name: { $first: '$items.product_name' },
          product_image: { $first: '$items.product_image' },
          product_price: { $first: '$items.price' },
          order_count: { $sum: 1 },
          total_quantity_sold: { $sum: '$items.quantity' },
          total_revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },
      { $sort: { total_revenue: -1 } },
      { $limit: limit },
    ]);

    res.json(result.map(r => ({
      id: r._id,
      name: r.product_name,
      image_url: r.product_image,
      price: r.product_price,
      order_count: r.order_count,
      total_quantity_sold: r.total_quantity_sold,
      total_revenue: r.total_revenue,
    })));
  } catch (error) {
    console.error('Top products error:', error);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

// Customer Database
router.get('/customers', async (req, res) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;

    const filter = { role: 'customer' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit))
      .lean();

    // Enrich with order stats
    const enriched = await Promise.all(customers.map(async (c) => {
      const stats = await Order.aggregate([
        { $match: { customer_email: c.email, payment_status: 'paid' } },
        { $group: { _id: null, total_orders: { $sum: 1 }, total_spent: { $sum: '$total' } } },
      ]);
      return {
        ...c,
        id: c._id,
        total_orders: stats[0]?.total_orders || 0,
        total_spent: stats[0]?.total_spent || 0,
      };
    }));

    res.json({ customers: enriched, count: enriched.length });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Create customer manually
router.post('/customers',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('phone').optional().isMobilePhone(),
    body('password').optional().isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, email, phone, password } = req.body;
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ error: 'Email already exists' });

      const defaultPassword = password || 'Customer@123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const customer = await User.create({ name, email, password: hashedPassword, phone: phone || null, role: 'customer' });

      await logAdminAction(req, 'CREATE', 'customer', customer._id, customer.name, { created: customer });

      res.status(201).json({
        message: 'Customer created successfully',
        customer: { id: customer._id, name: customer.name, email: customer.email, phone: customer.phone, role: customer.role },
        defaultPassword: password ? undefined : defaultPassword,
      });
    } catch (error) {
      console.error('Create customer error:', error);
      res.status(500).json({ error: 'Failed to create customer' });
    }
  }
);

// Recent Activities
router.get('/recent-activities', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('order_number customer_name total order_status createdAt')
      .lean();

    res.json(orders.map(o => ({
      type: 'order',
      id: o._id,
      reference: o.order_number,
      description: o.customer_name,
      amount: o.total,
      status: o.order_status,
      created_at: o.createdAt,
    })));
  } catch (error) {
    console.error('Recent activities error:', error);
    res.status(500).json({ error: 'Failed to fetch recent activities' });
  }
});

export default router;
