import dotenv from 'dotenv';
import Category from '../models/Category.js';
import connectDB from '../config/database.js';

dotenv.config();

const categories = [
  { name: 'Cakes', slug: 'cakes', icon: '🎂' },
  { name: 'Chocolate Bouquets', slug: 'chocolate-bouquets', icon: '🍫' },
  { name: 'Couple Gifts', slug: 'couple-gifts', icon: '💑' },
  { name: 'Event Needs', slug: 'event-needs', icon: '🎊' },
  { name: 'Flower Bouquets', slug: 'flower-bouquets', icon: '💐' },
  { name: 'Interior Gifts & Decor', slug: 'interior-gifts-decor', icon: '🏠' },
  { name: 'Mugs', slug: 'mugs', icon: '☕' },
  { name: 'Personalised Gifts', slug: 'personalised-gifts', icon: '🎁' },
  { name: 'Photo Frames', slug: 'photo-frames', icon: '🖼️' },
  { name: 'Plants', slug: 'plants', icon: '🌱' },
  { name: 'Printing Works', slug: 'printing-works', icon: '🖨️' },
  { name: 'T-Shirts', slug: 't-shirts', icon: '👕' },
];

const seedCategories = async () => {
  await connectDB();

  for (const categoryData of categories) {
    const existingCategory = await Category.findOne({ slug: categoryData.slug });

    if (existingCategory) {
      existingCategory.name = categoryData.name;
      existingCategory.icon = categoryData.icon;
      await existingCategory.save();
      console.log(`Category updated: ${categoryData.name}`);
    } else {
      await Category.create({
        ...categoryData,
        is_occasion: false,
        occasion_order: 0,
      });
      console.log(`Category created: ${categoryData.name}`);
    }
  }

  process.exit(0);
};

seedCategories().catch((error) => {
  console.error('Failed to seed categories:', error);
  process.exit(1);
});