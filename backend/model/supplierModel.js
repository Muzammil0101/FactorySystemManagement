import db from '../database/database.js';

const SupplierModel = {
  getAll: () => db.prepare('SELECT * FROM suppliers').all(),
  getById: (id) => db.prepare('SELECT * FROM suppliers WHERE id=?').get(id),
  create: (data) =>
    db.prepare('INSERT INTO suppliers (name, contact, address) VALUES (?, ?, ?)')
      .run(data.name, data.contact, data.address),
  update: (id, data) =>
    db.prepare('UPDATE suppliers SET name=?, contact=?, address=? WHERE id=?')
      .run(data.name, data.contact, data.address, id),
  delete: (id) => db.prepare('DELETE FROM suppliers WHERE id=?').run(id),
};

export default SupplierModel;