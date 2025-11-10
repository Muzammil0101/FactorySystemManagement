const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./factory.db", (err) => {
  if (err) console.error(err.message);
  else console.log("Connected to SQLite database.");
});

// Example table
db.run(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  quantity INTEGER,
  price REAL
)`);

module.exports = db;