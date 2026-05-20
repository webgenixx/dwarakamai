import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  user_name:  { type: String, required: true },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  title:      { type: String, trim: true, default: '' },
  comment:    { type: String, trim: true, required: true },
}, { timestamps: true });

// One review per user per product
reviewSchema.index({ product_id: 1, user_id: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
