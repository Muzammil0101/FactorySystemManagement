import express from 'express';
import SaleModel from '../model/saleModel.js';
const router = express.Router();

router.get('/', (req, res) => res.json(SaleModel.getAll()));
router.get('/:id', (req, res) => res.json(SaleModel.getById(req.params.id)));
router.post('/', (req, res) => res.json(SaleModel.create(req.body)));
router.put('/:id', (req, res) => res.json(SaleModel.update(req.params.id, req.body)));
router.delete('/:id', (req, res) => res.json(SaleModel.delete(req.params.id)));

export default router;