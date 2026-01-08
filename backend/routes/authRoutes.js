import express from "express";
import db, { logSystemAction } from "../database/database.js";
import { authLimiter, isValidEmail } from "../middleware/security.js";

const router = express.Router();

// LOGIN ROUTE
router.post("/login", authLimiter, (req, res) => {
  const { email, password, ip } = req.body;

  const user = db
    .prepare("SELECT * FROM users WHERE email = ? AND password = ?")
    .get(email, password);

  if (!user) {
    logSystemAction("LOGIN_FAILED", `Failed login attempt for ${email}`, email, ip);
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


// GET LOGS ROUTE
router.get("/logs", (req, res) => {
  try {
    const logs = db.prepare("SELECT * FROM login_logs ORDER BY id DESC LIMIT 50").all();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// CHANGE PASSWORD ROUTE
router.post("/change-password", authLimiter, (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, oldPassword);

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid old password" });
    }

    db.prepare("UPDATE users SET password = ? WHERE email = ?").run(newPassword, email);
    logSystemAction("PASSWORD_CHANGE", `Password changed for user ${email}`, email, req.ip);
    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;