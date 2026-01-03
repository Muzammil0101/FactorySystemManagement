"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _database = _interopRequireDefault(require("../database/database.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const ProductModel = {
  // Get all products
  getAll: () => _database.default.prepare('SELECT * FROM products').all(),
  // Get a product by ID
  getById: id => _database.default.prepare('SELECT * FROM products WHERE id = ?').get(id),
  // Create a new product
  create: data => _database.default.prepare(`INSERT INTO products 
      (name, category_id, supplier_id, stock_qty, cost_price, sell_price, sku)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).run(data.name, data.category_id || null, data.supplier_id || null, data.stock_qty || 0, data.cost_price || 0, data.sell_price || 0, data.sku || null),
  // Update an existing product
  update: (id, data) => _database.default.prepare(`UPDATE products SET 
      name = ?, 
      category_id = ?, 
      supplier_id = ?, 
      stock_qty = ?, 
      cost_price = ?, 
      sell_price = ?, 
      sku = ?
      WHERE id = ?`).run(data.name, data.category_id || null, data.supplier_id || null, data.stock_qty || 0, data.cost_price || 0, data.sell_price || 0, data.sku || null, id),
  // Delete a product
  delete: id => _database.default.prepare('DELETE FROM products WHERE id = ?').run(id)
};
var _default = exports.default = ProductModel;