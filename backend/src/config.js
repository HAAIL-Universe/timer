/**
 * Centralized configuration loading from environment variables.
 */

const path = require('path');

// Load .env from backend root before anything else
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,

  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    path: process.env.DB_PATH
      ? path.resolve(process.env.DB_PATH)
      : path.resolve(__dirname, '..', 'data', 'timer.db'),
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'dev',
  },

  get isDevelopment() {
    return this.nodeEnv === 'development';
  },

  get isProduction() {
    return this.nodeEnv === 'production';
  },

  get isTest() {
    return this.nodeEnv === 'test';
  },
};

module.exports = config;
