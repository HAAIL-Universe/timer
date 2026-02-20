/**
 * Jest setup: configure in-memory SQLite for tests.
 */

process.env.NODE_ENV = 'test';

const db = require('../src/db/connection');

// Ensure schema exists for test database
db.exec(`
  CREATE TABLE IF NOT EXISTS timers (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL CHECK(status IN ('stopped', 'running')),
    start_time INTEGER,
    elapsed_seconds INTEGER NOT NULL DEFAULT 0
  )
`);

afterEach(() => {
  db.exec('DELETE FROM timers');
});

afterAll(() => {
  db.close();
});
