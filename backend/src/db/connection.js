/**
 * Singleton better-sqlite3 database instance.
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Ensure data directory exists
const dbDir = path.dirname(config.db.path);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Use in-memory DB for tests to avoid file contention
const dbPath = config.isTest ? ':memory:' : config.db.path;

const db = new Database(dbPath, {
  verbose: config.isDevelopment ? console.log : undefined,
});

// WAL mode for better concurrent reads (skip for in-memory)
if (!config.isTest) {
  db.pragma('journal_mode = WAL');
}
db.pragma('foreign_keys = ON');

// Graceful shutdown
process.on('exit', () => db.close());

module.exports = db;
