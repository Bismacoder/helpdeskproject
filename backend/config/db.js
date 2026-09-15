const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

/**
 * Connect to MongoDB with automatic fallback to embedded database
 * if a local/remote MongoDB daemon is not accessible or if MONGO_URI
 * contains placeholders like '<db_password>'.
 */
let memoryServer = null;

const connectDB = async () => {
  let mongoUri = (process.env.MONGO_URI || '').trim();

  const isPlaceholderUri =
    !mongoUri ||
    mongoUri.includes('<') ||
    mongoUri.includes('>') ||
    mongoUri.includes('db_password') ||
    mongoUri.includes('your_password');

  let connected = false;

  if (!isPlaceholderUri) {
    try {
      console.log('[MongoDB] Connecting to external MongoDB database...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`[MongoDB] Connected to database: ${mongoose.connection.host}`);
      connected = true;
    } catch (err) {
      console.warn(`[MongoDB] External MongoDB URI unreachable (${err.message}). Starting embedded database...`);
    }
  } else if (mongoUri) {
    console.warn("[MongoDB] Notice: MONGO_URI in .env contains a placeholder ('<db_password>'). Using embedded database.");
  }

  if (!connected) {
    try {
      const dataDir = path.resolve(__dirname, '../data/db');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (!memoryServer) {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create({
          instance: {
            dbPath: dataDir,
          },
        });
      }

      const inMemoryUri = memoryServer.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[MongoDB] Embedded database active at: ${inMemoryUri}`);
    } catch (memErr) {
      console.error(`[MongoDB] Critical Database Startup Error: ${memErr.message}`);
      throw memErr;
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error(`[MongoDB Runtime Error]: ${err.message}`);
  });
};

module.exports = connectDB;
