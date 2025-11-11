import express from 'express';
import CustomerModel from '../model/customerModel.js';
const router = express.Router();

router.get('/', (req, res) => res.json(CustomerModel.getAll()));
router.get('/:id', (req, res) => res.json(CustomerModel.getById(req.params.id)));
router.post('/', (req, res) => res.json(CustomerModel.create(req.body)));
router.put('/:id', (req, res) => res.json(CustomerModel.update(req.params.id, req.body)));
router.delete('/:id', (req, res) => res.json(CustomerModel.delete(req.params.id)));

export default router;