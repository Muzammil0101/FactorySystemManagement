import express from 'express';
import PurchaseModel from '../model/purchaseModel.js';
const router = express.Router();

router.get('/', (req, res) => res.json(PurchaseModel.getAll()));
router.get('/:id', (req, res) => res.json(PurchaseModel.getById(req.params.id)));
router.post('/', (req, res) => res.json(PurchaseModel.create(req.body)));
router.put('/:id', (req, res) => res.json(PurchaseModel.update(req.params.id, req.body)));
router.delete('/:id', (req, res) => res.json(PurchaseModel.delete(req.params.id)));

export default router;