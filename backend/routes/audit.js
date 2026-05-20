import express from 'express';
import AuditLog from '../models/AuditLog.js';
import { authenticate, isSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get audit logs (Super Admin only)
router.get('/logs', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, adminId, entityType, action, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const filter = {};
    if (adminId) filter.admin_id = adminId;
    if (entityType) filter.entity_type = entityType;
    if (action) filter.action = action;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [totalLogs, logs] = await Promise.all([
      AuditLog.countDocuments(filter),
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(Number(offset)).limit(Number(limit)).lean(),
    ]);

    res.json({
      logs: logs.map(l => ({ ...l, id: l._id })),
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalLogs / limit),
        totalLogs,
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Error fetching audit logs' });
  }
});

// Get audit log statistics (Super Admin only)
router.get('/stats', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const [actionStats, entityStats, adminStats, recentCount] = await Promise.all([
      AuditLog.aggregate([{ $match: filter }, { $group: { _id: '$action', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      AuditLog.aggregate([{ $match: filter }, { $group: { _id: '$entity_type', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      AuditLog.aggregate([
        { $match: filter },
        { $group: { _id: { admin_id: '$admin_id', admin_email: '$admin_email', admin_name: '$admin_name' }, action_count: { $sum: 1 } } },
        { $sort: { action_count: -1 } },
        { $limit: 10 },
      ]),
      AuditLog.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
    ]);

    res.json({
      actionStats: actionStats.map(a => ({ action: a._id, count: a.count })),
      entityStats: entityStats.map(e => ({ entity_type: e._id, count: e.count })),
      adminStats: adminStats.map(a => ({
        admin_id: a._id.admin_id,
        admin_email: a._id.admin_email,
        admin_name: a._id.admin_name,
        action_count: a.action_count,
      })),
      recentActivity: recentCount,
    });
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({ message: 'Error fetching audit statistics' });
  }
});

// Get specific admin's activity
router.get('/admin/:adminId', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const { adminId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [totalLogs, logs] = await Promise.all([
      AuditLog.countDocuments({ admin_id: adminId }),
      AuditLog.find({ admin_id: adminId }).sort({ createdAt: -1 }).skip(Number(offset)).limit(Number(limit)).lean(),
    ]);

    res.json({
      logs: logs.map(l => ({ ...l, id: l._id })),
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalLogs / limit),
        totalLogs,
      },
    });
  } catch (error) {
    console.error('Error fetching admin activity:', error);
    res.status(500).json({ message: 'Error fetching admin activity' });
  }
});

export default router;
