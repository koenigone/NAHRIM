const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Point exactly to the .db file inside server/
const dbPath = path.join(__dirname, "NAHRIM.db");

console.log("Connecting to DB at:", dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

module.exports = db;