import express from 'express';
import ProductModel from '../model/productModel.js';

const router = express.Router();

// Get all products
router.get('/', (req, res) => {
  try {
    const products = ProductModel.getAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a product by ID
router.get('/:id', (req, res) => {
  try {
    const product = ProductModel.getById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new product
router.post('/', (req, res) => {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Product name is required' });

    const result = ProductModel.create(req.body);
    const product = ProductModel.getById(result.lastInsertRowid);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a product
router.put('/:id', (req, res) => {
  try {
    const existing = ProductModel.getById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    ProductModel.update(req.params.id, req.body);
    const updated = ProductModel.getById(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a product
router.delete('/:id', (req, res) => {
  try {
    const existing = ProductModel.getById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    ProductModel.delete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;