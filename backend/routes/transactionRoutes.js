import express from 'express';
import TransactionModel from '../model/transactionModel.js';
const router = express.Router();

router.get('/', (req, res) => res.json(TransactionModel.getAll()));
router.get('/:id', (req, res) => res.json(TransactionModel.getById(req.params.id)));
router.post('/', (req, res) => res.json(TransactionModel.create(req.body)));
router.put('/:id', (req, res) => res.json(TransactionModel.update(req.params.id, req.body)));
router.delete('/:id', (req, res) => res.json(TransactionModel.delete(req.params.id)));

export default router;