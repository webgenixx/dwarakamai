import mongoose from 'mongoose';

const homepageContentSchema = new mongoose.Schema({
  section: { type: String, required: true },
  content_type: { type: String, required: true }, // 'banner', 'offer_card', 'testimonial'
  title: { type: String, default: null },
  description: { type: String, default: null },
  image_url: { type: String, default: null },
  link_url: { type: String, default: null },
  display_order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('HomepageContent', homepageContentSchema);
