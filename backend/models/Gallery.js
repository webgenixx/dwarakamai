import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  title: { type: String, default: null },
  description: { type: String, default: null },
  image_url: { type: String, required: true },
  image_public_id: { type: String, default: null },
  category: { type: String, default: 'general' },
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

export default mongoose.model('Gallery', gallerySchema);
