"use strict";

var _express = _interopRequireDefault(require("express"));
var _cors = _interopRequireDefault(require("cors"));
var _productRoutes = _interopRequireDefault(require("./routes/productRoutes.js"));
var _categoryRoutes = _interopRequireDefault(require("./routes/categoryRoutes.js"));
var _customerRoutes = _interopRequireDefault(require("./routes/customerRoutes.js"));
var _purchaseRoutes = _interopRequireDefault(require("./routes/purchaseRoutes.js"));
var _saleRoutes = _interopRequireDefault(require("./routes/saleRoutes.js"));
var _transactionRoutes = _interopRequireDefault(require("./routes/transactionRoutes.js"));
var _stockRoutes = _interopRequireDefault(require("./routes/stockRoutes.js"));
var _authRoutes = _interopRequireDefault(require("./routes/authRoutes.js"));
var _supplierCustomerRoutes = _interopRequireDefault(require("./routes/supplierCustomerRoutes.js"));
var _profitRoutes = _interopRequireDefault(require("./routes/profitRoutes.js"));
var _backupService = require("./services/backupService.js");
var _helmet = _interopRequireDefault(require("helmet"));
var _security = require("./middleware/security.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const app = (0, _express.default)();

// Initialize Backup Service
(0, _backupService.initBackupService)();

// Middleware
// Middleware
app.use((0, _helmet.default)()); // Secure HTTP headers
app.use(_security.globalLimiter); // Rate limiting
app.use((0, _cors.default)({
  origin: 'http://localhost:3000',
  // Restrict to frontend only
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(_express.default.json());

// API Routes
app.use('/api/products', _productRoutes.default);
app.use('/api/categories', _categoryRoutes.default);
app.use('/api', _supplierCustomerRoutes.default);
app.use('/api/customers', _customerRoutes.default);
app.use('/api/purchases', _purchaseRoutes.default);
app.use('/api/sales', _saleRoutes.default);
app.use('/api/transactions', _transactionRoutes.default);
app.use('/api/stock', _stockRoutes.default);
app.use('/api/auth', _authRoutes.default);

// Profit & Loss Routes
app.use('/api', _profitRoutes.default);

// Backup Download Route
app.get('/api/backup/download', (req, res) => {
  try {
    const dbPath = (0, _backupService.getLatestBackupPath)();
    res.download(dbPath, 'facsys.db', err => {
      if (err) {
        console.error("Error downloading file:", err);
        if (!res.headersSent) {
          res.status(500).send("Could not download backup.");
        }
      }
    });
  } catch (error) {
    console.error("Backup download error:", error);
    res.status(500).send("Server error during backup download.");
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Backend is running',
    timestamp: new Date()
  });
});
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});