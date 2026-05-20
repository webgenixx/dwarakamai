import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  admin_email: { type: String, default: null },
  admin_name: { type: String, default: null },
  action: { type: String, required: true }, // 'CREATE', 'UPDATE', 'DELETE'
  entity_type: { type: String, required: true }, // 'product', 'order', 'category', etc.
  entity_id: { type: String, default: null },
  entity_name: { type: String, default: null },
  changes: { type: mongoose.Schema.Types.Mixed, default: null },
  ip_address: { type: String, default: null },
  user_agent: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);
