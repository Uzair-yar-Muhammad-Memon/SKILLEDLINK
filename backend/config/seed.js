require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');

const categories = [
  {
    name: 'Plumber',
    description: 'Professional plumbing services for homes and businesses',
    icon: 'plumber-icon.png'
  },
  {
    name: 'Electrician',
    description: 'Electrical installation, repair, and maintenance services',
    icon: 'electrician-icon.png'
  },
  {
    name: 'Carpenter',
    description: 'Woodworking and carpentry services for furniture and construction',
    icon: 'carpenter-icon.png'
  },
  {
    name: 'Tailor',
    description: 'Custom tailoring and clothing alteration services',
    icon: 'tailor-icon.png'
  },
  {
    name: 'Painter',
    description: 'Interior and exterior painting services',
    icon: 'painter-icon.png'
  },
  {
    name: 'Mason',
    description: 'Masonry and bricklaying services for construction',
    icon: 'mason-icon.png'
  },
  {
    name: 'Tutor',
    description: 'Educational tutoring services for all subjects and levels',
    icon: 'tutor-icon.png'
  },
  {
    name: 'Home Repair',
    description: 'General home repair and maintenance services',
    icon: 'repair-icon.png'
  },
  {
    name: 'Gardener',
    description: 'Garden maintenance and landscaping services',
    icon: 'gardener-icon.png'
  }
];

const seedDatabase = async () => {
  try {
    // Try Atlas first, then local MongoDB
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
      });
      console.log('✅ MongoDB Connected to Atlas');
    } catch (atlasError) {
      console.log('⚠️  Atlas connection failed, trying local MongoDB...');
      await mongoose.connect('mongodb://localhost:27017/skilllink');
      console.log('✅ MongoDB Connected to local instance');
    }
    
    // Clear existing categories
    await Category.deleteMany({});
    console.log('🗑️  Cleared existing categories');
    
    // Insert new categories
    await Category.insertMany(categories);
    console.log('✅ Categories seeded successfully');
    
    console.log('\n📊 Seeded Categories:');
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} - ${cat.description}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
