import express from 'express';
import db from '../database/database.js';

const router = express.Router();

// ============ STOCK IN ROUTES ============

// Get all stock in records
router.get('/stock-in', (req, res) => {
  try {
    const stockIn = db.prepare('SELECT * FROM stock_in ORDER BY date DESC').all();
    res.json(stockIn);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add stock in
router.post('/stock-in', (req, res) => {
  const { date, description, weight, rate, amount, supplier } = req.body;

  try {
    // Validate required fields
    if (!date || !description || !weight || !rate || !supplier) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (parseFloat(weight) <= 0) {
      return res.status(400).json({ error: 'Weight must be greater than 0' });
    }

    // Insert stock in record
    const result = db.prepare(`
      INSERT INTO stock_in (date, description, weight, rate, amount, supplier)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(date, description, weight, rate, amount, supplier);

    // Auto-create category if doesn't exist
    try {
      db.prepare(`
        INSERT OR IGNORE INTO categories (name, description)
        VALUES (?, '')
      `).run(description);
    } catch (e) {
      console.log('Category already exists or error:', e.message);
    }

    // Check if supplier exists, if not create
    const existingSupplier = db.prepare('SELECT * FROM suppliers WHERE name = ?').get(supplier);
    
    if (!existingSupplier) {
      db.prepare(`
        INSERT INTO suppliers (name, phone, city)
        VALUES (?, '', '')
      `).run(supplier);
    }

    // Add to supplier ledger
    db.prepare(`
      INSERT INTO supplier_ledger (supplier_name, date, description, weight, rate, debit, credit)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `).run(supplier, date, description, weight, rate, amount);

    const newRecord = db.prepare('SELECT * FROM stock_in WHERE id = ?').get(result.lastInsertRowid);
    
    res.json({
      success: true,
      message: `Successfully added ${weight} kg of ${description} from ${supplier}`,
      data: newRecord
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete stock in record
router.delete('/stock-in/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the record first to update ledger
    const record = db.prepare('SELECT * FROM stock_in WHERE id = ?').get(id);
    
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Delete from stock_in
    db.prepare('DELETE FROM stock_in WHERE id = ?').run(id);
    
    // Delete corresponding ledger entry
    db.prepare(`
      DELETE FROM supplier_ledger 
      WHERE supplier_name = ? AND date = ? AND description = ? AND credit = ?
      ORDER BY id DESC LIMIT 1
    `).run(record.supplier, record.date, record.description, record.amount);

    res.json({ success: true, message: 'Stock in record deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ STOCK OUT ROUTES ============

// Get all stock out records
router.get('/stock-out', (req, res) => {
  try {
    const stockOut = db.prepare('SELECT * FROM stock_out ORDER BY date DESC').all();
    res.json(stockOut);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add stock out
router.post('/stock-out', (req, res) => {
  const { date, description, weight, rate, amount, customer } = req.body;

  try {
    // Validate required fields
    if (!date || !description || !weight || !rate || !customer) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (parseFloat(weight) <= 0) {
      return res.status(400).json({ error: 'Weight must be greater than 0' });
    }

    // Calculate current stock
    const totalIn = db.prepare('SELECT SUM(weight) as total FROM stock_in').get();
    const totalOut = db.prepare('SELECT SUM(weight) as total FROM stock_out').get();
    const currentStock = (totalIn.total || 0) - (totalOut.total || 0);

    if (parseFloat(weight) > currentStock) {
      return res.status(400).json({ 
        error: `Not enough stock! Available: ${currentStock.toFixed(2)} kg` 
      });
    }

    // Insert stock out record
    const result = db.prepare(`
      INSERT INTO stock_out (date, description, weight, rate, amount, customer)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(date, description, weight, rate, amount, customer);

    // Auto-create category if doesn't exist
    try {
      db.prepare(`
        INSERT OR IGNORE INTO categories (name, description)
        VALUES (?, '')
      `).run(description);
    } catch (e) {
      console.log('Category already exists or error:', e.message);
    }

    // Check if customer exists, if not create
    const existingCustomer = db.prepare('SELECT * FROM customers WHERE name = ?').get(customer);
    
    if (!existingCustomer) {
      db.prepare(`
        INSERT INTO customers (name, phone, city)
        VALUES (?, '', '')
      `).run(customer);
    }

    // Add to customer ledger
    db.prepare(`
      INSERT INTO customer_ledger (customer_name, date, description, weight, rate, debit, credit)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `).run(customer, date, description, weight, rate, amount);

    const newRecord = db.prepare('SELECT * FROM stock_out WHERE id = ?').get(result.lastInsertRowid);
    
    res.json({
      success: true,
      message: `Successfully sold ${weight} kg of ${description} to ${customer}`,
      data: newRecord
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete stock out record
router.delete('/stock-out/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the record first to update ledger
    const record = db.prepare('SELECT * FROM stock_out WHERE id = ?').get(id);
    
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Delete from stock_out
    db.prepare('DELETE FROM stock_out WHERE id = ?').run(id);
    
    // Delete corresponding ledger entry
    db.prepare(`
      DELETE FROM customer_ledger 
      WHERE customer_name = ? AND date = ? AND description = ? AND debit = ?
      ORDER BY id DESC LIMIT 1
    `).run(record.customer, record.date, record.description, record.amount);

    res.json({ success: true, message: 'Stock out record deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ STOCK SUMMARY ROUTES ============

// Get current stock summary
router.get('/summary', (req, res) => {
  try {
    const totalIn = db.prepare('SELECT SUM(weight) as total FROM stock_in').get();
    const totalOut = db.prepare('SELECT SUM(weight) as total FROM stock_out').get();
    
    const stockInTotal = totalIn.total || 0;
    const stockOutTotal = totalOut.total || 0;
    const currentStock = stockInTotal - stockOutTotal;

    res.json({
      totalIn: stockInTotal,
      totalOut: stockOutTotal,
      currentStock: currentStock
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stock by category/description
router.get('/by-category', (req, res) => {
  try {
    const stockInByCategory = db.prepare(`
      SELECT description, SUM(weight) as total_in
      FROM stock_in
      GROUP BY description
    `).all();

    const stockOutByCategory = db.prepare(`
      SELECT description, SUM(weight) as total_out
      FROM stock_out
      GROUP BY description
    `).all();

    // Merge data
    const categoryMap = {};

    stockInByCategory.forEach(item => {
      categoryMap[item.description] = {
        description: item.description,
        stockIn: item.total_in,
        stockOut: 0,
        currentStock: item.total_in
      };
    });

    stockOutByCategory.forEach(item => {
      if (categoryMap[item.description]) {
        categoryMap[item.description].stockOut = item.total_out;
        categoryMap[item.description].currentStock -= item.total_out;
      } else {
        categoryMap[item.description] = {
          description: item.description,
          stockIn: 0,
          stockOut: item.total_out,
          currentStock: -item.total_out
        };
      }
    });

    res.json(Object.values(categoryMap));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ LEDGER ROUTES ============

// Get supplier ledger
router.get('/supplier-ledger/:supplierName', (req, res) => {
  try {
    const { supplierName } = req.params;
    const ledger = db.prepare(`
      SELECT * FROM supplier_ledger 
      WHERE supplier_name = ? 
      ORDER BY date DESC, id DESC
    `).all(supplierName);

    res.json(ledger);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer ledger
router.get('/customer-ledger/:customerName', (req, res) => {
  try {
    const { customerName } = req.params;
    const ledger = db.prepare(`
      SELECT * FROM customer_ledger 
      WHERE customer_name = ? 
      ORDER BY date DESC, id DESC
    `).all(customerName);

    res.json(ledger);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all suppliers with their ledgers
router.get('/suppliers-with-ledger', (req, res) => {
  try {
    const suppliers = db.prepare('SELECT * FROM suppliers').all();
    
    const suppliersWithLedger = suppliers.map(supplier => {
      const ledger = db.prepare(`
        SELECT * FROM supplier_ledger 
        WHERE supplier_name = ? 
        ORDER BY date DESC, id DESC
      `).all(supplier.name);

      return {
        ...supplier,
        ledger
      };
    });

    res.json(suppliersWithLedger);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all customers with their ledgers
router.get('/customers-with-ledger', (req, res) => {
  try {
    const customers = db.prepare('SELECT * FROM customers').all();
    
    const customersWithLedger = customers.map(customer => {
      const ledger = db.prepare(`
        SELECT * FROM customer_ledger 
        WHERE customer_name = ? 
        ORDER BY date DESC, id DESC
      `).all(customer.name);

      return {
        ...customer,
        ledger
      };
    });

    res.json(customersWithLedger);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;