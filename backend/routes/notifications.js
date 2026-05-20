import express from 'express';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get recent notifications for the logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const notifications = await Notification.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
      
    const unreadCount = notifications.filter(n => !n.read).length;
    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark all as read
router.patch('/mark-read', authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    await Notification.updateMany(
      { user_id: userId, read: false },
      { read: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Delete selected notifications (by array of ids) or all
router.delete('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { ids, deleteAll } = req.body;

    if (deleteAll) {
      await Notification.deleteMany({ user_id: userId });
      return res.json({ success: true, message: 'All notifications deleted' });
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No notification IDs provided' });
    }

    await Notification.deleteMany({ _id: { $in: ids }, user_id: userId });
    res.json({ success: true, message: `${ids.length} notification(s) deleted` });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    res.status(500).json({ error: 'Failed to delete notifications' });
  }
});

// Send notification to all users or specific users (Admin Only)
router.post('/send', authenticate, isAdmin, async (req, res) => {
  try {
    const { targetType, userIds, title, message, type = 'system', link = null } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    let targetUserIds = [];

    if (targetType === 'all') {
      // Find all users (customers and admins) or just customers?
      // Usually, system notifications should go to everyone.
      const users = await User.find({}, '_id');
      targetUserIds = users.map(u => u._id);
    } else if (targetType === 'specific') {
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: 'User IDs are required for specific target type' });
      }
      targetUserIds = userIds;
    } else {
      return res.status(400).json({ error: 'Invalid targetType' });
    }

    if (targetUserIds.length === 0) {
      return res.status(400).json({ error: 'No recipient users found' });
    }

    // Create notifications for all target users
    const notificationsToCreate = targetUserIds.map(userId => ({
      user_id: userId,
      title,
      message,
      type,
      link,
      read: false
    }));

    await Notification.insertMany(notificationsToCreate);

    res.json({
      success: true,
      message: `Notification successfully sent to ${targetUserIds.length} users.`
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Get all notifications (Admin Only)
router.get('/admin/list', authenticate, isAdmin, async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .populate('user_id', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ notifications });
  } catch (error) {
    console.error('Error listing notifications for admin:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

export default router;
