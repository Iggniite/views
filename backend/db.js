import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./views.db");

db.serialize(() => {

  // ✅ EXISTING TABLES (UNCHANGED)
  db.run(`CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    videoId TEXT UNIQUE,
    title TEXT,
    thumbnail TEXT,
    status TEXT DEFAULT 'active'
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    videoId TEXT,
    time TEXT,
    views INTEGER,
    count INTEGER
  )`);

  // ===============================
  // 🔥 NEW TABLE: proof_schedule
  // ===============================
  db.run(`CREATE TABLE IF NOT EXISTS proof_schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    videoId TEXT,
    time TEXT
  )`);

  // ===============================
  // 🔥 NEW TABLE: proofs
  // ===============================
  db.run(`CREATE TABLE IF NOT EXISTS proofs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    videoId TEXT,
    time TEXT,
    views INTEGER,
    imagePath TEXT
  )`);

});

export default db;