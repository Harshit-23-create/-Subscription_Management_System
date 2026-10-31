import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

let memoryServer: any = null;

export const connectDatabase = async (): Promise<typeof mongoose> => {
  mongoose.set('strictQuery', true);

  // Attempt real MongoDB URI first (MongoDB Atlas, local, or test db)
  try {
    const uri =
      process.env.NODE_ENV === 'test'
        ? process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/subscription_management_test'
        : env.MONGODB_URI;

    logger.info(`Connecting to MongoDB at: ${uri.replace(/:\/\/[^:]+:[^@]+@/, '://<credentials>@')}`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });
    logger.info('Connected to MongoDB database successfully.');
    return conn;
  } catch (err: any) {
    if (env.AUTO_MEMORY_DB || process.env.NODE_ENV === 'test') {
      logger.warn(`Could not connect to external MongoDB: ${err.message}`);
      logger.info('Auto-fallback activated: Starting MongoMemoryServer...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const uri = memoryServer.getUri();
        logger.info(`In-Memory MongoDB started at ${uri}`);
        const conn = await mongoose.connect(uri);
        logger.info('Connected to In-Memory MongoDB successfully.');
        return conn;
      } catch (memErr: any) {
        logger.error('Failed to start MongoMemoryServer fallback:', memErr.message);
        throw err;
      }
    } else {
      logger.error('MongoDB connection error:', err.message);
      throw err;
    }
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
    logger.info('MongoDB disconnected.');
  } catch (err: any) {
    logger.error('Error during database disconnection:', err.message);
  }
};

