import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

let razorpay = null;

// Initialize Razorpay only if credentials are available
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('✅ Razorpay initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Razorpay:', error.message);
    razorpay = null;
  }
} else {
  console.warn('⚠️  Razorpay credentials not found in environment variables. Razorpay payment method will not be available.');
}

export default razorpay;
