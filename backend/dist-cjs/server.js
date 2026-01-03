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
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const app = (0, _express.default)();

// Middleware
app.use((0, _cors.default)());
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