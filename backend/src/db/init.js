/**Initialize SQLite schema on startup.*/

const db = require('./connection');

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS timers (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'stopped' CHECK(status IN ('stopped', 'running')),
      start_time TEXT,
      elapsed_seconds INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_timers_status ON timers(status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_timers_created_at ON timers(created_at DESC)`);
}

module.exports = { initializeDatabase };
