import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  slug: { type: String }
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);

const addMugs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const exists = await Category.findOne({ name: 'Mugs' });
    if (exists) {
      console.log('Mugs category already exists');
    } else {
      await Category.create({ name: 'Mugs', description: 'Custom printed mugs', slug: 'mugs' });
      console.log('Added Mugs category successfully');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};

addMugs();
