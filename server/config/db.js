const mongoose = require('mongoose');

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cook_routine_db';

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log(`✅ MongoDB Connected: ${m.connection.host}/${m.connection.name}`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;
