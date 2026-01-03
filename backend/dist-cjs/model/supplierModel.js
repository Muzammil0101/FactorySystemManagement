"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _database = _interopRequireDefault(require("../database/database.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const SupplierModel = {
  getAll: () => _database.default.prepare('SELECT * FROM suppliers').all(),
  getById: id => _database.default.prepare('SELECT * FROM suppliers WHERE id=?').get(id),
  create: data => _database.default.prepare('INSERT INTO suppliers (name, contact, address) VALUES (?, ?, ?)').run(data.name, data.contact, data.address),
  update: (id, data) => _database.default.prepare('UPDATE suppliers SET name=?, contact=?, address=? WHERE id=?').run(data.name, data.contact, data.address, id),
  delete: id => _database.default.prepare('DELETE FROM suppliers WHERE id=?').run(id)
};
var _default = exports.default = SupplierModel;