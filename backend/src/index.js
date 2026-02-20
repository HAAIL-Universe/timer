/**Application entry point.*/

const config = require('./config');
const logger = require('./utils/logger');
const { initializeDatabase } = require('./db/init');
const express = require('express');
const router = require('./routes');

const app = express();

// Initialize database schema
try {
  initializeDatabase();
  logger.info('Database initialized');
} catch (err) {
  logger.error('Failed to initialize database:', err.message);
  process.exit(1);
}

// Mount main router
app.use(router);

// Start server
const server = app.listen(config.port, () => {
  logger.info(`Timer API server listening on port ${config.port} [${config.nodeEnv}]`);
});

// Graceful shutdown
function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  // Force exit after 5s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 5000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err.message);
  process.exit(1);
});

module.exports = app;
