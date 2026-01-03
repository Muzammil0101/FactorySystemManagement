"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _database = _interopRequireDefault(require("../database/database.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = _express.default.Router();

// LOGIN ROUTE
router.post("/login", (req, res) => {
  const {
    email,
    password,
    ip
  } = req.body;
  const user = _database.default.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  // Insert Login Log
  _database.default.prepare(`
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
var _default = exports.default = router;