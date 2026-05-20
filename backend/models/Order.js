import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  product_name: { type: String, required: true },
  product_image: { type: String, default: null },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  customization: { type: mongoose.Schema.Types.Mixed, default: null },
}, { _id: true });

const orderSchema = new mongoose.Schema({
  order_number: { type: String, required: true, unique: true },
  customer_name: { type: String, required: true },
  customer_email: { type: String, default: null },
  customer_phone: { type: String, required: true },
  shipping_address: { type: String, default: null },
  shipping_info: { type: mongoose.Schema.Types.Mixed, default: null },
  items: [orderItemSchema],
  subtotal: { type: Number, default: 0 },
  shipping_cost: { type: Number, default: 0 },
  service_charge: { type: Number, default: 0 },
  total: { type: Number, required: true },
  payment_method: { type: String, default: 'paytm' },
  payment_status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  order_status: { type: String, enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'], default: 'pending' },
  paytm_order_id: { type: String, default: null },
  paytm_transaction_id: { type: String, default: null },
  paytm_transaction_status: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
