import express from 'express';
import CategoryModel from '../model/categoryModel.js';
const router = express.Router();

router.get('/', (req, res) => res.json(CategoryModel.getAll()));
router.get('/:id', (req, res) => res.json(CategoryModel.getById(req.params.id)));
router.post('/', (req, res) => res.json(CategoryModel.create(req.body)));
router.put('/:id', (req, res) => res.json(CategoryModel.update(req.params.id, req.body)));
router.delete('/:id', (req, res) => res.json(CategoryModel.delete(req.params.id)));

export default router;