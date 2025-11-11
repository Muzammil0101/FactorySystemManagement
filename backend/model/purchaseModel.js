import db from '../database/database.js';

const PurchaseModel = {
  getAll: () => db.prepare('SELECT * FROM purchases').all(),
  getById: (id) => db.prepare('SELECT * FROM purchases WHERE id=?').get(id),
  create: (data) =>
    db.prepare(`INSERT INTO purchases (product_id, supplier_id, quantity, cost_price, total_cost, date)
                VALUES (?, ?, ?, ?, ?, ?)`)
      .run(data.product_id, data.supplier_id, data.quantity, data.cost_price, data.total_cost, data.date),
  update: (id, data) =>
    db.prepare(`UPDATE purchases SET product_id=?, supplier_id=?, quantity=?, cost_price=?, total_cost=?, date=? WHERE id=?`)
      .run(data.product_id, data.supplier_id, data.quantity, data.cost_price, data.total_cost, data.date, id),
  delete: (id) => db.prepare('DELETE FROM purchases WHERE id=?').run(id),
};

export default PurchaseModel;