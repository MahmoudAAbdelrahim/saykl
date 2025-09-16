// lib/db.ts
import mongoose from 'mongoose';

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return;

  try {
    await mongoose.connect(process.env.MONGO_URI!, {
      dbName: 'houdaDB',
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
}
