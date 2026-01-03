"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _database = _interopRequireDefault(require("../database/database.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const TransactionModel = {
  getAll: () => _database.default.prepare('SELECT * FROM transactions').all(),
  getById: id => _database.default.prepare('SELECT * FROM transactions WHERE id=?').get(id),
  create: data => _database.default.prepare('INSERT INTO transactions (type, reference_id, amount, date, note) VALUES (?, ?, ?, ?, ?)').run(data.type, data.reference_id, data.amount, data.date, data.note),
  update: (id, data) => _database.default.prepare('UPDATE transactions SET type=?, reference_id=?, amount=?, date=?, note=? WHERE id=?').run(data.type, data.reference_id, data.amount, data.date, data.note, id),
  delete: id => _database.default.prepare('DELETE FROM transactions WHERE id=?').run(id)
};
var _default = exports.default = TransactionModel;