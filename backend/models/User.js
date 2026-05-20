import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, required: true, trim: true },
  role: { type: String, enum: ['customer', 'admin', 'super_admin'], default: 'customer' },
  address: {
    line1:   { type: String, default: '' },
    landmark:{ type: String, default: '' },
    city:    { type: String, default: '' },
    state:   { type: String, default: '' },
    pincode: { type: String, default: '' },
  },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
