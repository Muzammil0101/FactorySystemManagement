import db from '../database/database.js';

const CustomerModel = {
  getAll: () => db.prepare('SELECT * FROM customers').all(),
  getById: (id) => db.prepare('SELECT * FROM customers WHERE id=?').get(id),
  create: (data) =>
    db.prepare('INSERT INTO customers (name, contact, address) VALUES (?, ?, ?)')
      .run(data.name, data.contact, data.address),
  update: (id, data) =>
    db.prepare('UPDATE customers SET name=?, contact=?, address=? WHERE id=?')
      .run(data.name, data.contact, data.address, id),
  delete: (id) => db.prepare('DELETE FROM customers WHERE id=?').run(id),
};

export default CustomerModel;