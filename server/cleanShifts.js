const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Shift = require('./models/Shift');

async function cleanShifts() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    const deleteResult = await Shift.deleteMany({});
    console.log(`🧹 Cleaned up ${deleteResult.deletedCount} dummy shift records.`);
    console.log('✨ All shift records removed. Database is fresh and clean.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning shifts:', error);
    process.exit(1);
  }
}

cleanShifts();
