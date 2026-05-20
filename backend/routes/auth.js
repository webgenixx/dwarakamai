import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { sendOTPEmail, sendWelcomeEmail, isEmailConfigured } from '../config/email.js';

const router = express.Router();

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Store OTP
const storeOTP = async (email, otp, purpose) => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await OTP.create({ email, otp, purpose, expiresAt });
};

// Verify OTP
const verifyOTP = async (email, otp, purpose) => {
  const record = await OTP.findOne({
    email,
    otp,
    purpose,
    used: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record) return false;

  record.used = true;
  await record.save();
  return true;
};

// Register
router.post('/register',
  [
    body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
    body('phone').notEmpty().withMessage('Phone number is required').isMobilePhone()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password, name, phone, address } = req.body;

      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ error: 'Email already registered' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        address: address || {},
      });

      if (email) {
        sendWelcomeEmail(email, name).catch((err) => console.error('Failed to send welcome email:', err));
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: { id: user._id, email: user.email, name: user.name, role: user.role, phone: user.phone, address: user.address },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// Login
router.post('/login',
  [
    body('password').notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
 
      const identifier = req.body.identifier || req.body.email;
      if (!identifier) {
        return res.status(400).json({ errors: [{ msg: 'Email or Phone is required' }] });
      }
      const { password } = req.body;
 
      const user = await User.findOne({
        $or: [
          { email: identifier.toLowerCase() },
          { phone: identifier }
        ]
      });

      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
 
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) return res.status(401).json({ error: 'Invalid credentials' });
 
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
 
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          address: user.address || {},
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// Forgot Password - Send OTP
router.post('/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email } = req.body;
      console.log(`\n📧 Forgot password request for: ${email}`);

      const user = await User.findOne({ email });
      if (!user) {
        return res.json({ message: 'If that email exists, we sent an OTP' });
      }

      if (!isEmailConfigured()) {
        console.error('Forgot password: email transport not configured (EMAIL_USER / EMAIL_PASSWORD)');
        return res.status(503).json({
          error:
            'Password reset email is not configured on this server. Please contact support or try again later.',
        });
      }

      const otp = generateOTP();
      await storeOTP(email, otp, 'password-reset');

      console.log(`\n🔐 Password Reset OTP for ${email}: ${otp}`);

      try {
        await sendOTPEmail(email, otp, 'password-reset');
        console.log(`✅ OTP email sent to ${email}`);
        // Never include OTP in JSON unless explicitly enabled (local testing only).
        const exposeOtpInResponse =
          process.env.EXPOSE_DEV_OTP_IN_RESPONSE === 'true' &&
          process.env.NODE_ENV !== 'production';
        return res.json({
          message: 'OTP sent to your email',
          ...(exposeOtpInResponse && { devOTP: otp }),
        });
      } catch (emailError) {
        console.error('❌ Email failed:', emailError.message, emailError.code || '');
        return res.status(503).json({
          error:
            'We could not send the reset email. Check server email settings (SMTP host, App Password, firewall) and try again, or contact support.',
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Failed to process request' });
    }
  }
);

// Reset Password
router.post('/reset-password',
  [
    body('email').isEmail().normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }),
    body('password').isLength({ min: 6 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, otp, password } = req.body;

      const isValid = await verifyOTP(email, otp, 'password-reset');
      if (!isValid) return res.status(400).json({ error: 'Invalid or expired OTP' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.findOneAndUpdate({ email }, { password: hashedPassword });

      if (!user) return res.status(404).json({ error: 'User not found' });

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }
);

// Get Profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update Profile
router.put('/profile',
  [
    body('name').trim().notEmpty(),
    body('phone').optional()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { name, phone, address } = req.body;

      const updates = { name, phone };
      if (address) updates.address = address;

      const user = await User.findByIdAndUpdate(
        decoded.id,
        updates,
        { new: true, select: '-password' }
      );

      if (!user) return res.status(404).json({ error: 'User not found' });

      res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
);

// Change Password
router.put('/change-password',
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) return res.status(401).json({ error: 'Current password is incorrect' });

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
);

export default router;
