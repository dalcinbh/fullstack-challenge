// Import required dependencies for SQLite database operations
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Define database file path within the database directory
// Creates absolute path to ensure consistent database location
const dbPath = path.resolve(__dirname, '../database/database.sqlite');

// Initialize SQLite database connection
// Creates database file if it doesn't exist, connects to existing file otherwise
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create database schema for text analysis storage
// Serialize ensures table creation completes before other operations
db.serialize(() => {
  // Create table to store the last analyzed text for term search functionality
  // Uses IF NOT EXISTS to avoid errors on subsequent application starts
  db.run(`
    CREATE TABLE IF NOT EXISTS last_analysis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Export database connection for use throughout the application
module.exports = db;
