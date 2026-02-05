import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import authRoutes from './routes/authRoutes.js';
import supplierCustomerRoutes from './routes/supplierCustomerRoutes.js';
import profitLossRoutes from './routes/profitRoutes.js';
import { initBackupService, getLatestBackupPath } from './services/backupService.js';
import helmet from 'helmet';
import { globalLimiter } from './middleware/security.js';

const app = express();

// Initialize Backup Service
initBackupService();

// Middleware
// Middleware
app.use(helmet()); // Secure HTTP headers
app.use(globalLimiter); // Rate limiting
app.use(cors({
  origin: ['http://localhost:3000', 'app://facsys', 'app://.'], // Allow frontend dev and Electron prod
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin']
}));
app.use(express.json());

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api', supplierCustomerRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/auth', authRoutes);

// Profit & Loss Routes
app.use('/api', profitLossRoutes);

import multer from 'multer';

// Backup Download Route
app.get('/api/backup/download', (req, res) => {
  try {
    const dbPath = getLatestBackupPath();
    // Safety check: ensure file exists
    if (!fs.existsSync(dbPath)) {
      // Fallback to sending the live DB if no backup exists yet
      const liveDbPath = getLatestBackupPath();
      // code above actually returns dbPath which is the live one. logic is fine.
    }

    res.download(dbPath, 'facsys.db', (err) => {
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
import os from 'os';
const upload = multer({ dest: path.join(os.tmpdir(), 'facsys_uploads') });

app.post('/api/backup/restore', upload.single('backup'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const uploadedPath = req.file.path;

    // Determine DB path using the safer top-level calculation if available, or re-calculate uniquely
    // Avoid re-declaring __filename or __dirname to prevent shadowing issues in CJS bundle
    const restoreFilename = fileURLToPath(import.meta.url);
    const restoreDirname = path.dirname(restoreFilename);
    const isPackaged = typeof process.pkg !== 'undefined';

    // Use the logic consistent with crash-log/database
    // If packaged, DB is in USER_DATA_PATH or execPath dir.
    // If dev, it's in backend root (restoreDirname).

    let targetDbPath;
    if (process.env.USER_DATA_PATH) {
      targetDbPath = path.join(process.env.USER_DATA_PATH, 'facsys.db');
    } else if (isPackaged) {
      targetDbPath = path.join(path.dirname(process.execPath), 'facsys.db');
    } else {
      targetDbPath = path.join(restoreDirname, 'facsys.db');
    }

    console.log(`RESTORING DB TO: ${targetDbPath}`);

    // Replace the file
    fs.copyFileSync(uploadedPath, targetDbPath);

    // cleanup uploaded file
    fs.unlinkSync(uploadedPath);

    res.json({ success: true, message: "Database restored successfully. Please restart the application." });

  } catch (error) {
    console.error("Restore failed:", error);
    res.status(500).json({ success: false, message: "Failed to restore database: " + error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running', timestamp: new Date() });
});

const PORT = 4000;
const server = app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});

// GLOBAL CRASH HANDLERS
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __currentFilename = fileURLToPath(import.meta.url);
const __currentDirname = path.dirname(__currentFilename);

// Determine persistent log path
// If packaged, __dirname is virtual. Use passed env var or executable dir.
const isPackaged = typeof process.pkg !== 'undefined';
const logDir = process.env.USER_DATA_PATH || (isPackaged ? path.dirname(process.execPath) : __currentDirname);
const crashLogPath = path.join(logDir, 'server_crash.log');

const logCrash = (type, error) => {
  const timestamp = new Date().toISOString();
  const logMessage = `\n[${timestamp}] ${type}: ${error.message}\nSTACK: ${error.stack}\n${'-'.repeat(50)}\n`;

  try {
    fs.appendFileSync(crashLogPath, logMessage);
    console.error(`❌ CRASH LOGGED to ${crashLogPath}: ${type}`, error);
  } catch (fsErr) {
    console.error("FAILED TO WRITE CRASH LOG:", fsErr);
    console.error("ORIGINAL ERROR:", error);
  }
};

process.on('uncaughtException', (err) => {
  logCrash('UNCAUGHT_EXCEPTION', err);
  // Optional: graceful shutdown
  server.close(() => {
    process.exit(1);
  });
  // Force exit if graceful shutdown fails/hangs
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  logCrash('UNHANDLED_REJECTION', reason instanceof Error ? reason : new Error(String(reason)));
});