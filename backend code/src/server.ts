import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { BackgroundScheduler } from './jobs/scheduler';
import { env } from './config/env';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    // 1. Connect to Database (real MongoDB or auto-memory fallback)
    await connectDatabase();

    // 2. Create Express app
    const app = createApp();

    // 3. Start HTTP Server
    const server = app.listen(env.PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      logger.info(`REST API available at: http://localhost:${env.PORT}${env.API_PREFIX}`);
      logger.info(`Interactive API Docs at: http://localhost:${env.PORT}/api/docs`);
    });

    // 4. Start background scheduler
    BackgroundScheduler.start();

    // Graceful shutdown
    const handleShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Gracefully shutting down...`);
      BackgroundScheduler.stop();
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDatabase();
        process.exit(0);
      });

      // Force shutdown after 10s timeout
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));

    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled Rejection at:', reason?.stack || reason);
    });

    process.on('uncaughtException', (err: Error) => {
      logger.error('Uncaught Exception:', err.message, err.stack);
      process.exit(1);
    });
  } catch (error: any) {
    logger.error('Fatal error during server startup:', error.message);
    process.exit(1);
  }
};

startServer();

