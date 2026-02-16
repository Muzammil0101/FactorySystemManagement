"use strict";

var _express = _interopRequireDefault(require("express"));
var _cors = _interopRequireDefault(require("cors"));
var _helmet = _interopRequireDefault(require("helmet"));
var _multer = _interopRequireDefault(require("multer"));
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
var _os = _interopRequireDefault(require("os"));
var _url = require("url");
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
var _security = require("./middleware/security.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const app = (0, _express.default)();

// --- PATH & ENVIRONMENT SETUP ---
const __currentFilename = (0, _url.fileURLToPath)(require('url').pathToFileURL(__filename).toString());
const __currentDirname = _path.default.dirname(__currentFilename);
const isPackaged = typeof process.pkg !== 'undefined';

// Determine persistent log path
const logDir = process.env.USER_DATA_PATH || (isPackaged ? _path.default.dirname(process.execPath) : __currentDirname);
const crashLogPath = _path.default.join(logDir, 'server_crash.log');

// --- CRASH LOGGING ---
const logCrash = (type, error) => {
  const timestamp = new Date().toISOString();
  const logMessage = `\n[${timestamp}] ${type}: ${error.message}\nSTACK: ${error.stack}\n${'-'.repeat(50)}\n`;
  try {
    _fs.default.appendFileSync(crashLogPath, logMessage);
    console.error(`❌ CRASH LOGGED to ${crashLogPath}: ${type}`, error);
  } catch (fsErr) {
    console.error("FAILED TO WRITE CRASH LOG:", fsErr);
    console.error("ORIGINAL ERROR:", error);
  }
};
process.on('uncaughtException', err => {
  logCrash('UNCAUGHT_EXCEPTION', err);
  // Optional: graceful shutdown
  const server = app.listen(); // Get reference if possible, or just exit
  setTimeout(() => process.exit(1), 1000);
});
process.on('unhandledRejection', (reason, promise) => {
  logCrash('UNHANDLED_REJECTION', reason instanceof Error ? reason : new Error(String(reason)));
});

// Initialize Backup Service
(0, _backupService.initBackupService)();

// Middleware
app.use((0, _helmet.default)()); // Secure HTTP headers
app.use(_security.globalLimiter); // Rate limiting
app.use((0, _cors.default)({
  origin: ['http://localhost:3000', 'app://facsys', 'app://.'],
  // Allow frontend dev and Electron prod
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin']
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
    // Safety check: ensure file exists
    if (!_fs.default.existsSync(dbPath)) {
      return res.status(404).send("Backup file not found.");
    }
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

// Backup Restore Route
const upload = (0, _multer.default)({
  dest: _path.default.join(_os.default.tmpdir(), 'facsys_uploads')
});
app.post('/api/backup/restore', upload.single('backup'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }
    const uploadedPath = req.file.path;

    // Use the logic consistent with crash-log/database
    // If packaged, DB is in USER_DATA_PATH or execPath dir.
    // If dev, it's in backend root (__currentDirname).
    let targetDbPath;
    if (process.env.USER_DATA_PATH) {
      targetDbPath = _path.default.join(process.env.USER_DATA_PATH, 'facsys.db');
    } else if (isPackaged) {
      targetDbPath = _path.default.join(_path.default.dirname(process.execPath), 'facsys.db');
    } else {
      targetDbPath = _path.default.join(__currentDirname, 'facsys.db');
    }
    console.log(`RESTORING DB TO: ${targetDbPath}`);

    // Replace the file
    _fs.default.copyFileSync(uploadedPath, targetDbPath);

    // cleanup uploaded file
    _fs.default.unlinkSync(uploadedPath);
    res.json({
      success: true,
      message: "Database restored successfully. Please restart the application."
    });
  } catch (error) {
    console.error("Restore failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore database: " + error.message
    });
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
const server = app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});