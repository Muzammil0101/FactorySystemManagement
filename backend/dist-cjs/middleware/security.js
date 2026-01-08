"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isValidEmail = exports.globalLimiter = exports.authLimiter = void 0;
var _expressRateLimit = _interopRequireDefault(require("express-rate-limit"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Global Rate Limiter
// 100 requests per 15 minutes per IP
const globalLimiter = exports.globalLimiter = (0, _expressRateLimit.default)({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes"
  }
});

// Auth Rate Limiter (Strict)
// 5 login attempts per 15 minutes per IP to prevent brute force
const authLimiter = exports.authLimiter = (0, _expressRateLimit.default)({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts, please try again later"
  }
});

// Helper for validating email format
const isValidEmail = email => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
exports.isValidEmail = isValidEmail;