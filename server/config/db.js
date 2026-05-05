const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const configuredDbPath = process.env.DB_PATH;
const defaultDbPath = path.join(__dirname, "../NAHRIM.db");
const dbPath = configuredDbPath
  ? path.isAbsolute(configuredDbPath)
    ? configuredDbPath
    : path.resolve(__dirname, configuredDbPath)
  : defaultDbPath;

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

console.log("Connecting to DB at:", dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS METMalaysia (
      MM_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      MM_Date DATE NOT NULL UNIQUE,
      MM_Min INTEGER NOT NULL,
      MM_Max INTEGER NOT NULL,
      MM_Current INTEGER NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS OpenWeatherMap (
      OWM_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      OWM_Date DATE NOT NULL UNIQUE,
      OWM_Min INTEGER NOT NULL,
      OWM_Max INTEGER NOT NULL,
      OWM_Current REAL NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Windy (
      Win_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Win_Date DATE NOT NULL UNIQUE,
      Win_Min REAL NOT NULL,
      Win_Max REAL NOT NULL,
      Win_Current REAL NOT NULL
    )
  `);
});

module.exports = db;
