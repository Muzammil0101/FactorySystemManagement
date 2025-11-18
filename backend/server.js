import express from 'express';
import cors from 'cors';

import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/transactions', transactionRoutes);

// LOGIN ROUTE
app.use('/api/auth', authRoutes);

const PORT = 4000;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));