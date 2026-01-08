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
  origin: 'http://localhost:3000', // Restrict to frontend only
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// Backup Download Route
app.get('/api/backup/download', (req, res) => {
  try {
    const dbPath = getLatestBackupPath();
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running', timestamp: new Date() });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});