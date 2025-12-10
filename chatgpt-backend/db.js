import sqlite3 from "sqlite3";
sqlite3.verbose();

const db = new sqlite3.Database("./chat.db");

// Tabelle anlegen
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

export default db;
