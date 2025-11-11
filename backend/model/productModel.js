import db from '../database/database.js';

const ProductModel = {
  // Get all products
  getAll: () => db.prepare('SELECT * FROM products').all(),

  // Get a product by ID
  getById: (id) => db.prepare('SELECT * FROM products WHERE id = ?').get(id),

  // Create a new product
  create: (data) =>
    db.prepare(`INSERT INTO products 
      (name, category_id, supplier_id, stock_qty, cost_price, sell_price, sku)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(
        data.name,
        data.category_id || null,
        data.supplier_id || null,
        data.stock_qty || 0,
        data.cost_price || 0,
        data.sell_price || 0,
        data.sku || null
      ),

  // Update an existing product
  update: (id, data) =>
    db.prepare(`UPDATE products SET 
      name = ?, 
      category_id = ?, 
      supplier_id = ?, 
      stock_qty = ?, 
      cost_price = ?, 
      sell_price = ?, 
      sku = ?
      WHERE id = ?`)
      .run(
        data.name,
        data.category_id || null,
        data.supplier_id || null,
        data.stock_qty || 0,
        data.cost_price || 0,
        data.sell_price || 0,
        data.sku || null,
        id
      ),

  // Delete a product
  delete: (id) => db.prepare('DELETE FROM products WHERE id = ?').run(id),
};

export default ProductModel;