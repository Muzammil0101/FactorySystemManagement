"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _productModel = _interopRequireDefault(require("../model/productModel.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = _express.default.Router();

// Get all products
router.get('/', (req, res) => {
  try {
    const products = _productModel.default.getAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// Get a product by ID
router.get('/:id', (req, res) => {
  try {
    const product = _productModel.default.getById(req.params.id);
    if (!product) return res.status(404).json({
      error: 'Product not found'
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// Create a new product
router.post('/', (req, res) => {
  try {
    if (!req.body.name) return res.status(400).json({
      error: 'Product name is required'
    });
    const result = _productModel.default.create(req.body);
    const product = _productModel.default.getById(result.lastInsertRowid);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// Update a product
router.put('/:id', (req, res) => {
  try {
    const existing = _productModel.default.getById(req.params.id);
    if (!existing) return res.status(404).json({
      error: 'Product not found'
    });
    _productModel.default.update(req.params.id, req.body);
    const updated = _productModel.default.getById(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// Delete a product
router.delete('/:id', (req, res) => {
  try {
    const existing = _productModel.default.getById(req.params.id);
    if (!existing) return res.status(404).json({
      error: 'Product not found'
    });
    _productModel.default.delete(req.params.id);
    res.json({
      message: 'Product deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});
var _default = exports.default = router;