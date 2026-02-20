/**
 * Data access layer for timer records.
 */

const db = require('../db/connection');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS timers (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK(status IN ('stopped', 'running')),
  start_time INTEGER,
  elapsed_seconds INTEGER NOT NULL DEFAULT 0
)`;

db.exec(SCHEMA);

const stmts = {
  insert: db.prepare(
    'INSERT INTO timers (id, status, start_time, elapsed_seconds) VALUES (?, ?, ?, ?)'
  ),
  findById: db.prepare('SELECT * FROM timers WHERE id = ?'),
  update: db.prepare(
    'UPDATE timers SET status = ?, start_time = ?, elapsed_seconds = ? WHERE id = ?'
  ),
  delete: db.prepare('DELETE FROM timers WHERE id = ?'),
};

/**
 * Create a new timer record.
 */
async function createTimer(id, status, startTime, elapsedSeconds) {
  stmts.insert.run(id, status, startTime ?? null, elapsedSeconds ?? 0);
  return stmts.findById.get(id);
}

/**
 * Find a timer by ID.
 */
async function findTimerById(id) {
  const row = stmts.findById.get(id);
  return row || null;
}

/**
 * Update an existing timer.
 */
async function updateTimer(id, status, startTime, elapsedSeconds) {
  const result = stmts.update.run(status, startTime ?? null, elapsedSeconds ?? 0, id);
  if (result.changes === 0) return null;
  return stmts.findById.get(id);
}

/**
 * Delete a timer by ID.
 */
async function deleteTimer(id) {
  const result = stmts.delete.run(id);
  return result.changes > 0;
}

module.exports = { createTimer, findTimerById, updateTimer, deleteTimer };
