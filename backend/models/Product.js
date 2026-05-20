import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, default: null },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  image_url: { type: String, default: null },
  image_public_id: { type: String, default: null },
  images: [
    {
      url: { type: String },
      public_id: { type: String },
    }
  ],
  customizable: { type: Boolean, default: false },
  customization_options: { type: mongoose.Schema.Types.Mixed, default: null },
  material: { type: String, default: null, trim: true },
  sizes: [{ type: String, trim: true }],
  valentine_special: { type: Boolean, default: false },
  special_offer: { type: Boolean, default: false },
  stock_quantity: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

// Virtual to get category name (used in populated results)
productSchema.virtual('category_name').get(function () {
  return this.category_id?.name || null;
});
productSchema.virtual('category_slug').get(function () {
  return this.category_id?.slug || null;
});
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.model('Product', productSchema);
