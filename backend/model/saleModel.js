import db from '../database/database.js';

const SaleModel = {
  getAll: () => db.prepare('SELECT * FROM sales').all(),
  getById: (id) => db.prepare('SELECT * FROM sales WHERE id=?').get(id),
  create: (data) =>
    db.prepare(`INSERT INTO sales (product_id, customer_id, quantity, sell_price, total_sale, date)
                VALUES (?, ?, ?, ?, ?, ?)`)
      .run(data.product_id, data.customer_id, data.quantity, data.sell_price, data.total_sale, data.date),
  update: (id, data) =>
    db.prepare(`UPDATE sales SET product_id=?, customer_id=?, quantity=?, sell_price=?, total_sale=?, date=? WHERE id=?`)
      .run(data.product_id, data.customer_id, data.quantity, data.sell_price, data.total_sale, data.date, id),
  delete: (id) => db.prepare('DELETE FROM sales WHERE id=?').run(id),
};

export default SaleModel;