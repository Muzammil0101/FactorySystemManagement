import db from '../database/database.js';

const CategoryModel = {
  getAll: () => db.prepare('SELECT * FROM categories').all(),
  getById: (id) => db.prepare('SELECT * FROM categories WHERE id=?').get(id),
  create: (data) => db.prepare('INSERT INTO categories (name) VALUES (?)').run(data.name),
  update: (id, data) => db.prepare('UPDATE categories SET name=? WHERE id=?').run(data.name, id),
  delete: (id) => db.prepare('DELETE FROM categories WHERE id=?').run(id),
};

export default CategoryModel;