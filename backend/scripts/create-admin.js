import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import connectDB from '../config/database.js';

dotenv.config();

const adminData = {
  name: process.env.ADMIN_NAME || 'Admin',
  email: process.env.ADMIN_EMAIL || 'admin@dwaraka.com',
  password: process.env.ADMIN_PASSWORD || 'admin@123',
  phone: process.env.ADMIN_PHONE || '9999999999',
  role: process.env.ADMIN_ROLE || 'admin',
};

const seedAdmin = async () => {
  await connectDB();

  const existingAdmin = await User.findOne({ email: adminData.email });
  const hashedPassword = await bcrypt.hash(adminData.password, 10);

  if (existingAdmin) {
    existingAdmin.name = adminData.name;
    existingAdmin.password = hashedPassword;
    existingAdmin.phone = adminData.phone;
    existingAdmin.role = adminData.role;

    await existingAdmin.save();
    console.log(`Admin updated: ${adminData.email}`);
  } else {
    await User.create({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      phone: adminData.phone,
      role: adminData.role,
    });

    console.log(`Admin created: ${adminData.email}`);
  }

  process.exit(0);
};

seedAdmin().catch((error) => {
  console.error('Failed to seed admin:', error);
  process.exit(1);
});