const mongoose = require('mongoose');

/**
 * Connect to MongoDB with automatic fallback to MongoMemoryServer
 * if a local/remote MongoDB daemon is not currently accessible.
 */
let memoryServer = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/helpdesk';

  try {
    // Attempt external MongoDB connection with a 1.5s timeout
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 1500,
    });
    
    console.log(`[MongoDB] Connected to external database: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[MongoDB] External Mongo URI unreachable (${err.message}). Starting embedded database fallback...`);
    
    try {
      if (!memoryServer) {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
      }
      const inMemoryUri = memoryServer.getUri();
      
      await mongoose.connect(inMemoryUri);
      console.log(`[MongoDB] Connected to embedded in-memory database at: ${inMemoryUri}`);
    } catch (memErr) {
      console.error(`[MongoDB] Critical Database Error: ${memErr.message}`);
      throw memErr;
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error(`[MongoDB Connection Error]: ${err.message}`);
  });
};

module.exports = connectDB;

