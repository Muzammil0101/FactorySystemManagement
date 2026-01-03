"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _database = _interopRequireDefault(require("../database/database.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const CategoryModel = {
  getAll: () => _database.default.prepare('SELECT * FROM categories').all(),
  getById: id => _database.default.prepare('SELECT * FROM categories WHERE id=?').get(id),
  create: data => _database.default.prepare('INSERT INTO categories (name) VALUES (?)').run(data.name),
  update: (id, data) => _database.default.prepare('UPDATE categories SET name=? WHERE id=?').run(data.name, id),
  delete: id => _database.default.prepare('DELETE FROM categories WHERE id=?').run(id)
};
var _default = exports.default = CategoryModel;