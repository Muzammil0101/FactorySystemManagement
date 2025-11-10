const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Test route
app.get("/status", (req, res) => {
  res.json({ message: "Backend running" });
});

// CRUD Example for products
app.get("/products", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) res.status(500).json(err);
    else res.json(rows);
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));