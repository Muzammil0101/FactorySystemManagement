import express from 'express';
import SupplierModel from '../model/supplierModel.js';
const router = express.Router();

router.get('/', (req, res) => res.json(SupplierModel.getAll()));
router.get('/:id', (req, res) => res.json(SupplierModel.getById(req.params.id)));
router.post('/', (req, res) => res.json(SupplierModel.create(req.body)));
router.put('/:id', (req, res) => res.json(SupplierModel.update(req.params.id, req.body)));
router.delete('/:id', (req, res) => res.json(SupplierModel.delete(req.params.id)));

export default router;