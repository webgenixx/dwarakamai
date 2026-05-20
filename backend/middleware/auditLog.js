import AuditLog from '../models/AuditLog.js';

// Middleware to log admin actions
const logAdminAction = async (req, action, entityType, entityId, entityName, changes = null) => {
  try {
    const adminId = req.user?.id;
    const adminEmail = req.user?.email;
    const adminName = req.user?.name;
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.get('user-agent');

    await AuditLog.create({
      admin_id: adminId || null,
      admin_email: adminEmail,
      admin_name: adminName,
      action,
      entity_type: entityType,
      entity_id: entityId ? String(entityId) : null,
      entity_name: entityName,
      changes,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
    // Don't throw - don't break the main operation
  }
};

// Helper function to compare objects and get changes
const getChanges = (oldData, newData) => {
  const changes = { before: {}, after: {} };
  const oldObj = oldData?.toObject ? oldData.toObject() : (oldData || {});
  const newObj = newData?.toObject ? newData.toObject() : (newData || {});
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  allKeys.forEach((key) => {
    if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
      changes.before[key] = oldObj[key];
      changes.after[key] = newObj[key];
    }
  });

  return Object.keys(changes.before).length > 0 ? changes : null;
};

export { logAdminAction, getChanges };
