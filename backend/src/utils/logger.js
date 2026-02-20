/**
 * Logger utility wrapping morgan and console for structured logging.
 */

const morgan = require('morgan');

const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

function currentLevel() {
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production') return LOG_LEVELS.warn;
  if (env === 'test') return LOG_LEVELS.error;
  return LOG_LEVELS.debug;
}

function shouldLog(level) {
  return LOG_LEVELS[level] <= currentLevel();
}

function formatMessage(level, args) {
  const timestamp = new Date().toISOString();
  return [`[${timestamp}] [${level.toUpperCase()}]`, ...args];
}

const logger = {
  error(...args) {
    if (shouldLog('error')) console.error(...formatMessage('error', args));
  },

  warn(...args) {
    if (shouldLog('warn')) console.warn(...formatMessage('warn', args));
  },

  info(...args) {
    if (shouldLog('info')) console.log(...formatMessage('info', args));
  },

  debug(...args) {
    if (shouldLog('debug')) console.log(...formatMessage('debug', args));
  },

  /**
   * Returns morgan middleware configured for the current environment.
   */
  httpMiddleware(format) {
    const morganFormat = format || (process.env.NODE_ENV === 'production' ? 'combined' : 'dev');

    // Skip HTTP logging in test environment
    if (process.env.NODE_ENV === 'test') {
      return (_req, _res, next) => next();
    }

    return morgan(morganFormat, {
      stream: {
        write(message) {
          // morgan adds a newline; trim it
          const trimmed = message.trim();
          if (trimmed) console.log(trimmed);
        },
      },
    });
  },
};

module.exports = logger;
