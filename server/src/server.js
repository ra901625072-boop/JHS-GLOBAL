import os from 'os';
import app from './app.js';
import connectDB, { disconnectDB } from './config/db.js';
import './models/index.js';
import env from './config/env.js';
import logger from './utils/logger.js';

const getNetworkIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

const startServer = async () => {
  try {
    try {
      await connectDB();
    } catch (dbError) {
      if (env.NODE_ENV === 'production') {
        throw dbError;
      }
      logger.warn('Running without database connection in development mode.');
    }

    const host = '0.0.0.0';
    const server = app.listen(env.PORT, host, () => {
      const netIp = getNetworkIp();
      logger.info(`Export B2B API Server running on port ${env.PORT} in [${env.NODE_ENV}] mode`);
      logger.info(`Local:   http://localhost:${env.PORT}/api/v1/health`);
      logger.info(`Network: http://${netIp}:${env.PORT}/api/v1/health`);
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} signal received. Closing HTTP server and database connection.`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Promise Rejection:', reason);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception thrown:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
