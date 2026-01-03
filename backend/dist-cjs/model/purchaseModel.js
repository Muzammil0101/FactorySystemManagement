"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _database = _interopRequireDefault(require("../database/database.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const PurchaseModel = {
  getAll: () => _database.default.prepare('SELECT * FROM purchases').all(),
  getById: id => _database.default.prepare('SELECT * FROM purchases WHERE id=?').get(id),
  create: data => _database.default.prepare(`INSERT INTO purchases (product_id, supplier_id, quantity, cost_price, total_cost, date)
                VALUES (?, ?, ?, ?, ?, ?)`).run(data.product_id, data.supplier_id, data.quantity, data.cost_price, data.total_cost, data.date),
  update: (id, data) => _database.default.prepare(`UPDATE purchases SET product_id=?, supplier_id=?, quantity=?, cost_price=?, total_cost=?, date=? WHERE id=?`).run(data.product_id, data.supplier_id, data.quantity, data.cost_price, data.total_cost, data.date, id),
  delete: id => _database.default.prepare('DELETE FROM purchases WHERE id=?').run(id)
};
var _default = exports.default = PurchaseModel;