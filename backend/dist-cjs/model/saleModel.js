"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _database = _interopRequireDefault(require("../database/database.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const SaleModel = {
  getAll: () => _database.default.prepare('SELECT * FROM sales').all(),
  getById: id => _database.default.prepare('SELECT * FROM sales WHERE id=?').get(id),
  create: data => _database.default.prepare(`INSERT INTO sales (product_id, customer_id, quantity, sell_price, total_sale, date)
                VALUES (?, ?, ?, ?, ?, ?)`).run(data.product_id, data.customer_id, data.quantity, data.sell_price, data.total_sale, data.date),
  update: (id, data) => _database.default.prepare(`UPDATE sales SET product_id=?, customer_id=?, quantity=?, sell_price=?, total_sale=?, date=? WHERE id=?`).run(data.product_id, data.customer_id, data.quantity, data.sell_price, data.total_sale, data.date, id),
  delete: id => _database.default.prepare('DELETE FROM sales WHERE id=?').run(id)
};
var _default = exports.default = SaleModel;