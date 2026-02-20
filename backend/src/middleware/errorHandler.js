/**
 * Global error handling middleware for consistent JSON error responses.
 */

const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  if (!isOperational) {
    logger.error('Unhandled error:', err.stack || err.message);
  }

  const body = {
    error: isOperational ? err.message : 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  };

  if (process.env.NODE_ENV === 'development') {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}

module.exports = { errorHandler, AppError };
