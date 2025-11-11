import db from '../database/database.js';

const TransactionModel = {
  getAll: () => db.prepare('SELECT * FROM transactions').all(),
  getById: (id) => db.prepare('SELECT * FROM transactions WHERE id=?').get(id),
  create: (data) =>
    db.prepare('INSERT INTO transactions (type, reference_id, amount, date, note) VALUES (?, ?, ?, ?, ?)')
      .run(data.type, data.reference_id, data.amount, data.date, data.note),
  update: (id, data) =>
    db.prepare('UPDATE transactions SET type=?, reference_id=?, amount=?, date=?, note=? WHERE id=?')
      .run(data.type, data.reference_id, data.amount, data.date, data.note, id),
  delete: (id) => db.prepare('DELETE FROM transactions WHERE id=?').run(id),
};

export default TransactionModel;