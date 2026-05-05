const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const configuredDbPath = process.env.DB_PATH;
const defaultDbPath = path.join(__dirname, "../NAHRIM.db");
const dbPath = configuredDbPath
  ? path.isAbsolute(configuredDbPath)
    ? configuredDbPath
    : path.resolve(__dirname, configuredDbPath)
  : defaultDbPath;

console.log("Connecting to DB at:", dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

module.exports = db;