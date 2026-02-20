/**
 * Business logic for timer lifecycle management.
 */

const { v4: uuidv4 } = require('uuid');
const repo = require('../repositories/timerRepository');
const logger = require('../utils/logger');

class TimerNotFoundError extends Error {
  constructor(id) {
    super(`Timer not found: ${id}`);
    this.name = 'TimerNotFoundError';
    this.statusCode = 404;
  }
}

/**
 * Format a timer row for API response.
 */
function formatTimer(row) {
  return {
    id: row.id,
    status: row.status,
    elapsed_seconds: row.elapsed_seconds,
    start_time: row.start_time,
  };
}

/**
 * Compute current elapsed_seconds for a potentially running timer.
 */
function computeElapsed(row) {
  if (row.status === 'running' && row.start_time != null) {
    const additionalMs = Date.now() - row.start_time;
    const additionalSecs = Math.floor(additionalMs / 1000);
    return row.elapsed_seconds + additionalSecs;
  }
  return row.elapsed_seconds;
}

/**
 * Create a new timer in stopped state.
 */
async function createTimer() {
  const id = uuidv4();
  logger.info('Creating timer', id);
  const row = await repo.createTimer(id, 'stopped', null, 0);
  return formatTimer(row);
}

/**
 * Start a timer by ID.
 */
async function startTimer(id) {
  const row = await repo.findTimerById(id);
  if (!row) throw new TimerNotFoundError(id);

  // Idempotent: already running, return current state
  if (row.status === 'running') {
    logger.debug('Timer already running', id);
    return formatTimer({ ...row, elapsed_seconds: computeElapsed(row) });
  }

  const now = Date.now();
  logger.info('Starting timer', id);
  const updated = await repo.updateTimer(id, 'running', now, row.elapsed_seconds);
  return formatTimer(updated);
}

/**
 * Stop a timer by ID.
 */
async function stopTimer(id) {
  const row = await repo.findTimerById(id);
  if (!row) throw new TimerNotFoundError(id);

  // Idempotent: already stopped, return current state
  if (row.status === 'stopped') {
    logger.debug('Timer already stopped', id);
    return formatTimer(row);
  }

  const elapsed = computeElapsed(row);
  logger.info('Stopping timer', id, 'elapsed:', elapsed);
  const updated = await repo.updateTimer(id, 'stopped', null, elapsed);
  return formatTimer(updated);
}

/**
 * Get timer state by ID with computed elapsed.
 */
async function getTimer(id) {
  const row = await repo.findTimerById(id);
  if (!row) throw new TimerNotFoundError(id);

  return formatTimer({ ...row, elapsed_seconds: computeElapsed(row) });
}

module.exports = { createTimer, startTimer, stopTimer, getTimer, TimerNotFoundError };
