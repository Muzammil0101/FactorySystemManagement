import express from "express";
import db from "../database/database.js";

const router = express.Router();

// LOGIN ROUTE
router.post("/login", (req, res) => {
  const { email, password, ip } = req.body;

  const user = db
    .prepare("SELECT * FROM users WHERE email = ? AND password = ?")
    .get(email, password);

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  // Insert Login Log
  db.prepare(`
    INSERT INTO login_logs (email, login_time, ip_address)
    VALUES (?, ?, ?)
  `).run(email, new Date().toISOString(), ip || "Unknown");

  return res.json({
    success: true,
    message: "Login successful",
    user: {
      email: user.email,
      role: user.role
    }
  });
});

export default router;