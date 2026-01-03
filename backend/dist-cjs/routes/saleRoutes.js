"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _saleModel = _interopRequireDefault(require("../model/saleModel.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = _express.default.Router();
router.get('/', (req, res) => res.json(_saleModel.default.getAll()));
router.get('/:id', (req, res) => res.json(_saleModel.default.getById(req.params.id)));
router.post('/', (req, res) => res.json(_saleModel.default.create(req.body)));
router.put('/:id', (req, res) => res.json(_saleModel.default.update(req.params.id, req.body)));
router.delete('/:id', (req, res) => res.json(_saleModel.default.delete(req.params.id)));
var _default = exports.default = router;