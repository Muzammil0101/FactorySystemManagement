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

const app = express();

// Middleware
app.use(cors());
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running', timestamp: new Date() });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});