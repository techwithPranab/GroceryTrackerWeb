'use strict';

require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');
const { port } = require('./config/env');
const logger = require('./utils/logger');

const startServer = async () => {
  await connectDB();

  const server = app.listen(port, () => {
    logger.info(`🚀 Server running on http://localhost:${port}`);
    logger.info(`📦 Environment: ${process.env.NODE_ENV}`);
    logger.info(`🏥 Health check: http://localhost:${port}/health`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled Rejection: ${reason}`);
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}`);
    process.exit(1);
  });
};

startServer();
