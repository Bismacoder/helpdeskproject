const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

/**
 * Global cached connection across serverless function invocations
 */
let cached = global._mongooseConnection;
if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

let memoryServer = null;

const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NETLIFY ||
  process.env.RENDER
);

const isProduction = process.env.NODE_ENV === 'production' || isServerless;

/**
 * Connect to MongoDB with connection pooling, serverless caching,
 * fast failure on timeout, and local embedded database fallback.
 */
const connectDB = async () => {
  // 1. Return existing active connection if ready
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose.connection;
    return cached.conn;
  }

  // 2. Await in-flight connection promise if already connecting
  if (cached.promise) {
    return await cached.promise;
  }

  let mongoUri = (process.env.MONGO_URI || '').trim();

  const isPlaceholderUri =
    !mongoUri ||
    mongoUri.includes('<') ||
    mongoUri.includes('>') ||
    mongoUri.includes('db_password') ||
    mongoUri.includes('your_password');

  // Disable Mongoose command buffering so queries fail immediately if not connected
  mongoose.set('bufferCommands', false);

  const mongooseOpts = {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000, // 10s timeout for server selection
    socketTimeoutMS: 45000,
  };

  // Only attach runtime error handler once
  if (mongoose.connection.listenerCount('error') === 0) {
    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB Runtime Error]: ${err.message}`);
    });
  }

  // Case A: Valid external MongoDB URI provided
  if (!isPlaceholderUri) {
    try {
      console.log('[MongoDB] Connecting to external MongoDB database...');
      cached.promise = mongoose.connect(mongoUri, mongooseOpts).then((m) => {
        console.log(`[MongoDB] Connected to database: ${m.connection.host}`);
        cached.conn = m.connection;
        return m.connection;
      });

      return await cached.promise;
    } catch (err) {
      cached.promise = null;
      console.warn(`[MongoDB] External MongoDB URI connection error: ${err.message}`);

      // In production / serverless, do NOT fallback to memory server because it cannot run on Lambda/Vercel
      if (isProduction) {
        throw new Error(
          `MongoDB connection failed: ${err.message}. Please verify your MONGO_URI in environment variables and MongoDB Atlas Network Access (allow 0.0.0.0/0).`
        );
      }
    }
  } else {
    if (isProduction) {
      const msg = mongoUri
        ? "MONGO_URI contains placeholder values ('<db_password>'). Please provide a valid MongoDB connection string."
        : "MONGO_URI environment variable is missing. Please configure MONGO_URI in your environment variables (e.g. Vercel dashboard).";
      console.error(`[MongoDB Configuration Error]: ${msg}`);
      throw new Error(`MongoDB connection failed: ${msg}`);
    }
    console.warn('[MongoDB] Notice: MONGO_URI is missing or contains placeholders. Falling back to local embedded database.');
  }

  // Case B: Local development fallback using MongoMemoryServer
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
    cached.promise = mongoose.connect(inMemoryUri, mongooseOpts).then((m) => {
      console.log(`[MongoDB] Embedded database active at: ${inMemoryUri}`);
      cached.conn = m.connection;
      return m.connection;
    });

    return await cached.promise;
  } catch (memErr) {
    cached.promise = null;
    console.error(`[MongoDB] Critical Database Startup Error: ${memErr.message}`);
    throw memErr;
  }
};

module.exports = connectDB;
