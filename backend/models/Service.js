import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, default: null },
  price_range: { type: String, default: null },
  image_url: { type: String, default: null },
  image_public_id: { type: String, default: null },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Service', serviceSchema);
