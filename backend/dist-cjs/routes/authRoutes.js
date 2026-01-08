"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _database = _interopRequireWildcard(require("../database/database.js"));
var _security = require("../middleware/security.js");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = _express.default.Router();

// LOGIN ROUTE
router.post("/login", _security.authLimiter, (req, res) => {
  const {
    email,
    password,
    ip
  } = req.body;
  const user = _database.default.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
  if (!user) {
    (0, _database.logSystemAction)("LOGIN_FAILED", `Failed login attempt for ${email}`, email, ip);
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

// GET LOGS ROUTE
router.get("/logs", (req, res) => {
  try {
    const logs = _database.default.prepare("SELECT * FROM login_logs ORDER BY id DESC LIMIT 50").all();
    res.json(logs);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch logs"
    });
  }
});

// CHANGE PASSWORD ROUTE
router.post("/change-password", _security.authLimiter, (req, res) => {
  const {
    email,
    oldPassword,
    newPassword
  } = req.body;
  try {
    const user = _database.default.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, oldPassword);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid old password"
      });
    }
    _database.default.prepare("UPDATE users SET password = ? WHERE email = ?").run(newPassword, email);
    (0, _database.logSystemAction)("PASSWORD_CHANGE", `Password changed for user ${email}`, email, req.ip);
    res.json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});
var _default = exports.default = router;