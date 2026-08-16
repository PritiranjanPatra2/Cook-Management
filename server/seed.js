const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const Dish = require('./models/Dish');
const Shift = require('./models/Shift');
const Settings = require('./models/Settings');

const defaultDishes = [
  { name: 'Rice', category: 'Rice' },
  { name: 'Dal', category: 'Dal' },
  { name: 'Soyabin Curry', category: 'Curry' },
  { name: 'Aloo Bhaja', category: 'Side' },
  { name: 'Roti', category: 'Bread' },
  { name: 'Paneer Curry', category: 'Curry' },
  { name: 'Chicken Curry', category: 'Curry' }
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cook_routine_db';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // 1. Seed / Update Settings
    let settings = await Settings.findOne();
    const salt = await bcrypt.genSalt(10);
    const passcodeHash = await bcrypt.hash('7894', salt);

    if (!settings) {
      settings = await Settings.create({
        passcodeHash,
        trackingStartDate: new Date('2026-08-16T00:00:00.000Z'),
        cookName: 'Cook',
        shiftsPerDay: 2,
        morningShiftName: 'Morning',
        eveningShiftName: 'Evening',
        customReasons: [
          'Personal',
          'Sick',
          'Emergency',
          'Festival / Holiday',
          'No Floor / No Work',
          'Did Not Inform',
          'Other'
        ]
      });
      console.log('✅ Settings initialized with passcode 7894 and tracking start 16 Aug 2026.');
    } else {
      console.log('ℹ️ Settings already exist. Preserving current settings.');
    }

    // 2. Seed Dishes
    const dishMap = {};
    for (const d of defaultDishes) {
      let dish = await Dish.findOne({ name: d.name });
      if (!dish) {
        dish = await Dish.create({
          name: d.name,
          category: d.category,
          active: true
        });
        console.log(`+ Added dish: ${d.name}`);
      }
      dishMap[d.name] = dish._id;
    }

    console.log('🎉 Database initialized with default settings and dish library (no dummy shifts).');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
