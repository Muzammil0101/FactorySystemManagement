"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _database = _interopRequireDefault(require("../database/database.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// // import express from 'express';
// // import db from '../database/database.js';

// // const router = express.Router();

// // // ============ SUPPLIER ROUTES ============

// // // Get all suppliers with their ledgers
// // router.get('/suppliers', (req, res) => {
// //   try {
// //     const suppliers = db.prepare(`
// //       SELECT id, name, phone, city 
// //       FROM suppliers 
// //       ORDER BY name ASC
// //     `).all();

// //     // Get ledger for each supplier
// //     const suppliersWithLedger = suppliers.map(supplier => {
// //       const ledger = db.prepare(`
// //         SELECT * FROM supplier_ledger 
// //         WHERE supplier_name = ? 
// //         ORDER BY date DESC, id DESC
// //       `).all(supplier.name);

// //       return {
// //         ...supplier,
// //         ledger
// //       };
// //     });

// //     res.json(suppliersWithLedger);
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // Get single supplier with ledger
// // router.get('/suppliers/:id', (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);

// //     if (!supplier) {
// //       return res.status(404).json({ error: 'Supplier not found' });
// //     }

// //     const ledger = db.prepare(`
// //       SELECT * FROM supplier_ledger 
// //       WHERE supplier_name = ? 
// //       ORDER BY date DESC, id DESC
// //     `).all(supplier.name);

// //     res.json({ ...supplier, ledger });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // Add new supplier
// // router.post('/suppliers', (req, res) => {
// //   const { name, phone, city } = req.body;

// //   try {
// //     if (!name || !name.trim()) {
// //       return res.status(400).json({ error: 'Supplier name is required' });
// //     }

// //     // Check if supplier already exists
// //     const existing = db.prepare('SELECT * FROM suppliers WHERE name = ?').get(name.trim());
// //     if (existing) {
// //       return res.status(400).json({ error: 'Supplier with this name already exists' });
// //     }

// //     const result = db.prepare(`
// //       INSERT INTO suppliers (name, phone, city)
// //       VALUES (?, ?, ?)
// //     `).run(name.trim(), phone || '', city || '');

// //     const newSupplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(result.lastInsertRowid);

// //     res.json({
// //       success: true,
// //       message: 'Supplier added successfully',
// //       data: { ...newSupplier, ledger: [] }
// //     });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // Update supplier
// // router.put('/suppliers/:id', (req, res) => {
// //   const { id } = req.params;
// //   const { name, phone, city } = req.body;

// //   try {
// //     const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
// //     if (!supplier) {
// //       return res.status(404).json({ error: 'Supplier not found' });
// //     }

// //     db.prepare(`
// //       UPDATE suppliers 
// //       SET name = ?, phone = ?, city = ?
// //       WHERE id = ?
// //     `).run(name || supplier.name, phone || supplier.phone, city || supplier.city, id);

// //     const updated = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);

// //     res.json({
// //       success: true,
// //       message: 'Supplier updated successfully',
// //       data: updated
// //     });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // Delete supplier
// // router.delete('/suppliers/:id', (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);

// //     if (!supplier) {
// //       return res.status(404).json({ error: 'Supplier not found' });
// //     }

// //     // Delete supplier ledger entries
// //     db.prepare('DELETE FROM supplier_ledger WHERE supplier_name = ?').run(supplier.name);

// //     // Delete supplier
// //     db.prepare('DELETE FROM suppliers WHERE id = ?').run(id);

// //     res.json({ success: true, message: 'Supplier deleted successfully' });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // Add payment to supplier (debit entry)
// // router.post('/suppliers/:id/payment', (req, res) => {
// //   const { id } = req.params;
// //   const { amount, date, description } = req.body;

// //   try {
// //     if (!amount || parseFloat(amount) <= 0) {
// //       return res.status(400).json({ error: 'Valid amount is required' });
// //     }

// //     const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
// //     if (!supplier) {
// //       return res.status(404).json({ error: 'Supplier not found' });
// //     }

// //     // Add debit entry (payment made to supplier)
// //     const result = db.prepare(`
// //       INSERT INTO supplier_ledger (supplier_name, date, description, weight, rate, debit, credit)
// //       VALUES (?, ?, ?, ?, ?, ?, ?)
// //     `).run(
// //       supplier.name,
// //       date || new Date().toISOString().split('T')[0],
// //       description || 'Payment Made',
// //       '-',
// //       '-',
// //       parseFloat(amount),
// //       0
// //     );

// //     const newEntry = db.prepare('SELECT * FROM supplier_ledger WHERE id = ?').get(result.lastInsertRowid);

// //     res.json({
// //       success: true,
// //       message: `Payment of $${amount} made to ${supplier.name}`,
// //       data: newEntry
// //     });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // Update supplier ledger entry
// // router.put('/suppliers/ledger/:ledgerId', (req, res) => {
// //   const { ledgerId } = req.params;
// //   const { date, description, weight, rate, debit, credit } = req.body;

// //   try {
// //     const entry = db.prepare('SELECT * FROM supplier_ledger WHERE id = ?').get(ledgerId);
// //     if (!entry) {
// //       return res.status(404).json({ error: 'Ledger entry not found' });
// //     }

// //     db.prepare(`
// //       UPDATE supplier_ledger 
// //       SET date = ?, description = ?, weight = ?, rate = ?, debit = ?, credit = ?
// //       WHERE id = ?
// //     `).run(
// //       date || entry.date,
// //       description || entry.description,
// //       weight !== undefined ? weight : entry.weight,
// //       rate !== undefined ? rate : entry.rate,
// //       debit !== undefined ? parseFloat(debit) : entry.debit,
// //       credit !== undefined ? parseFloat(credit) : entry.credit,
// //       ledgerId
// //     );

// //     const updated = db.prepare('SELECT * FROM supplier_ledger WHERE id = ?').get(ledgerId);

// //     res.json({
// //       success: true,
// //       message: 'Ledger entry updated successfully',
// //       data: updated
// //     });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // Delete supplier ledger entry
// // router.delete('/suppliers/ledger/:ledgerId', (req, res) => {
// //   const { ledgerId } = req.params;

// //   try {
// //     const entry = db.prepare('SELECT * FROM supplier_ledger WHERE id = ?').get(ledgerId);
// //     if (!entry) {
// //       return res.status(404).json({ error: 'Ledger entry not found' });
// //     }

// //     db.prepare('DELETE FROM supplier_ledger WHERE id = ?').run(ledgerId);

// //     res.json({
// //       success: true,
// //       message: 'Ledger entry deleted successfully'
// //     });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // ============ CUSTOMER ROUTES ============

// // // Get all customers with their ledgers
// // router.get('/customers', (req, res) => {
// //   try {
// //     const customers = db.prepare(`
// //       SELECT id, name, phone, city 
// //       FROM customers 
// //       ORDER BY name ASC
// //     `).all();

// //     // Get ledger for each customer
// //     const customersWithLedger = customers.map(customer => {
// //       const ledger = db.prepare(`
// //         SELECT * FROM customer_ledger 
// //         WHERE customer_name = ? 
// //         ORDER BY date DESC, id DESC
// //       `).all(customer.name);

// //       return {
// //         ...customer,
// //         ledger
// //       };
// //     });

// //     res.json(customersWithLedger);
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // Get single customer with ledger
// // router.get('/customers/:id', (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);

// //     if (!customer) {
// //       return res.status(404).json({ error: 'Customer not found' });
// //     }

// //     const ledger = db.prepare(`
// //       SELECT * FROM customer_ledger 
// //       WHERE customer_name = ? 
// //       ORDER BY date DESC, id DESC
// //     `).all(customer.name);

// //     res.json({ ...customer, ledger });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // Add new customer
// // router.post('/customers', (req, res) => {
// //   const { name, phone, city } = req.body;

// //   try {
// //     if (!name || !name.trim()) {
// //       return res.status(400).json({ error: 'Customer name is required' });
// //     }

// //     // Check if customer already exists
// //     const existing = db.prepare('SELECT * FROM customers WHERE name = ?').get(name.trim());
// //     if (existing) {
// //       return res.status(400).json({ error: 'Customer with this name already exists' });
// //     }

// //     const result = db.prepare(`
// //       INSERT INTO customers (name, phone, city)
// //       VALUES (?, ?, ?)
// //     `).run(name.trim(), phone || '', city || '');

// //     const newCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);

// //     res.json({
// //       success: true,
// //       message: 'Customer added successfully',
// //       data: { ...newCustomer, ledger: [] }
// //     });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // Update customer
// // router.put('/customers/:id', (req, res) => {
// //   const { id } = req.params;
// //   const { name, phone, city } = req.body;

// //   try {
// //     const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
// //     if (!customer) {
// //       return res.status(404).json({ error: 'Customer not found' });
// //     }

// //     db.prepare(`
// //       UPDATE customers 
// //       SET name = ?, phone = ?, city = ?
// //       WHERE id = ?
// //     `).run(name || customer.name, phone || customer.phone, city || customer.city, id);

// //     const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);

// //     res.json({
// //       success: true,
// //       message: 'Customer updated successfully',
// //       data: updated
// //     });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // Delete customer
// // router.delete('/customers/:id', (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);

// //     if (!customer) {
// //       return res.status(404).json({ error: 'Customer not found' });
// //     }

// //     // Delete customer ledger entries
// //     db.prepare('DELETE FROM customer_ledger WHERE customer_name = ?').run(customer.name);

// //     // Delete customer
// //     db.prepare('DELETE FROM customers WHERE id = ?').run(id);

// //     res.json({ success: true, message: 'Customer deleted successfully' });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // Receive payment from customer (credit entry)
// // router.post('/customers/:id/payment', (req, res) => {
// //   const { id } = req.params;
// //   const { amount, date, description } = req.body;

// //   try {
// //     if (!amount || parseFloat(amount) <= 0) {
// //       return res.status(400).json({ error: 'Valid amount is required' });
// //     }

// //     const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
// //     if (!customer) {
// //       return res.status(404).json({ error: 'Customer not found' });
// //     }

// //     // Add credit entry (payment received from customer)
// //     const result = db.prepare(`
// //       INSERT INTO customer_ledger (customer_name, date, description, weight, rate, debit, credit)
// //       VALUES (?, ?, ?, ?, ?, ?, ?)
// //     `).run(
// //       customer.name,
// //       date || new Date().toISOString().split('T')[0],
// //       description || 'Payment Received',
// //       '-',
// //       '-',
// //       0,
// //       parseFloat(amount)
// //     );

// //     const newEntry = db.prepare('SELECT * FROM customer_ledger WHERE id = ?').get(result.lastInsertRowid);

// //     res.json({
// //       success: true,
// //       message: `Payment of $${amount} received from ${customer.name}`,
// //       data: newEntry
// //     });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // Update customer ledger entry
// // router.put('/customers/ledger/:ledgerId', (req, res) => {
// //   const { ledgerId } = req.params;
// //   const { date, description, weight, rate, debit, credit } = req.body;

// //   try {
// //     const entry = db.prepare('SELECT * FROM customer_ledger WHERE id = ?').get(ledgerId);
// //     if (!entry) {
// //       return res.status(404).json({ error: 'Ledger entry not found' });
// //     }

// //     db.prepare(`
// //       UPDATE customer_ledger 
// //       SET date = ?, description = ?, weight = ?, rate = ?, debit = ?, credit = ?
// //       WHERE id = ?
// //     `).run(
// //       date || entry.date,
// //       description || entry.description,
// //       weight !== undefined ? weight : entry.weight,
// //       rate !== undefined ? rate : entry.rate,
// //       debit !== undefined ? parseFloat(debit) : entry.debit,
// //       credit !== undefined ? parseFloat(credit) : entry.credit,
// //       ledgerId
// //     );

// //     const updated = db.prepare('SELECT * FROM customer_ledger WHERE id = ?').get(ledgerId);

// //     res.json({
// //       success: true,
// //       message: 'Ledger entry updated successfully',
// //       data: updated
// //     });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // Delete customer ledger entry
// // router.delete('/customers/ledger/:ledgerId', (req, res) => {
// //   const { ledgerId } = req.params;

// //   try {
// //     const entry = db.prepare('SELECT * FROM customer_ledger WHERE id = ?').get(ledgerId);
// //     if (!entry) {
// //       return res.status(404).json({ error: 'Ledger entry not found' });
// //     }

// //     db.prepare('DELETE FROM customer_ledger WHERE id = ?').run(ledgerId);

// //     res.json({
// //       success: true,
// //       message: 'Ledger entry deleted successfully'
// //     });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // ============ BALANCE CALCULATION ROUTES ============

// // // Get supplier balance
// // router.get('/suppliers/:id/balance', (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);

// //     if (!supplier) {
// //       return res.status(404).json({ error: 'Supplier not found' });
// //     }

// //     const totals = db.prepare(`
// //       SELECT 
// //         SUM(debit) as total_debit,
// //         SUM(credit) as total_credit
// //       FROM supplier_ledger
// //       WHERE supplier_name = ?
// //     `).get(supplier.name);

// //     const totalDebit = totals.total_debit || 0;
// //     const totalCredit = totals.total_credit || 0;
// //     const balance = totalCredit - totalDebit; // Positive = we owe supplier

// //     res.json({
// //       supplier_name: supplier.name,
// //       total_debit: totalDebit,
// //       total_credit: totalCredit,
// //       balance: balance,
// //       status: balance >= 0 ? 'payable' : 'paid'
// //     });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // Get customer balance
// // router.get('/customers/:id/balance', (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);

// //     if (!customer) {
// //       return res.status(404).json({ error: 'Customer not found' });
// //     }

// //     const totals = db.prepare(`
// //       SELECT 
// //         SUM(debit) as total_debit,
// //         SUM(credit) as total_credit
// //       FROM customer_ledger
// //       WHERE customer_name = ?
// //     `).get(customer.name);

// //     const totalDebit = totals.total_debit || 0;
// //     const totalCredit = totals.total_credit || 0;
// //     const balance = totalDebit - totalCredit; // Positive = customer owes us

// //     res.json({
// //       customer_name: customer.name,
// //       total_debit: totalDebit,
// //       total_credit: totalCredit,
// //       balance: balance,
// //       status: balance >= 0 ? 'receivable' : 'payable'
// //     });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // export default router;

// import express from 'express';
// import db from '../database/database.js';

// const router = express.Router();

// // ============ SUPPLIER ROUTES ============

// // Get all suppliers with their ledgers
// router.get('/suppliers', (req, res) => {
//   try {
//     const suppliers = db.prepare(`
//       SELECT id, name, phone, city 
//       FROM suppliers 
//       ORDER BY name ASC
//     `).all();

//     // Get ledger for each supplier
//     const suppliersWithLedger = suppliers.map(supplier => {
//       const ledger = db.prepare(`
//         SELECT * FROM supplier_ledger 
//         WHERE supplier_name = ? 
//         ORDER BY date DESC, id DESC
//       `).all(supplier.name);

//       return {
//         ...supplier,
//         ledger
//       };
//     });

//     res.json(suppliersWithLedger);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get single supplier with ledger
// router.get('/suppliers/:id', (req, res) => {
//   try {
//     const { id } = req.params;
//     const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);

//     if (!supplier) {
//       return res.status(404).json({ error: 'Supplier not found' });
//     }

//     const ledger = db.prepare(`
//       SELECT * FROM supplier_ledger 
//       WHERE supplier_name = ? 
//       ORDER BY date DESC, id DESC
//     `).all(supplier.name);

//     res.json({ ...supplier, ledger });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Add new supplier
// router.post('/suppliers', (req, res) => {
//   const { name, phone, city } = req.body;

//   try {
//     if (!name || !name.trim()) {
//       return res.status(400).json({ error: 'Supplier name is required' });
//     }

//     // Check if supplier already exists
//     const existing = db.prepare('SELECT * FROM suppliers WHERE name = ?').get(name.trim());
//     if (existing) {
//       return res.status(400).json({ error: 'Supplier with this name already exists' });
//     }

//     const result = db.prepare(`
//       INSERT INTO suppliers (name, phone, city)
//       VALUES (?, ?, ?)
//     `).run(name.trim(), phone || '', city || '');

//     const newSupplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(result.lastInsertRowid);

//     res.json({
//       success: true,
//       message: 'Supplier added successfully',
//       data: { ...newSupplier, ledger: [] }
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Update supplier
// router.put('/suppliers/:id', (req, res) => {
//   const { id } = req.params;
//   const { name, phone, city } = req.body;

//   try {
//     const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
//     if (!supplier) {
//       return res.status(404).json({ error: 'Supplier not found' });
//     }

//     db.prepare(`
//       UPDATE suppliers 
//       SET name = ?, phone = ?, city = ?
//       WHERE id = ?
//     `).run(name || supplier.name, phone || supplier.phone, city || supplier.city, id);

//     const updated = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);

//     res.json({
//       success: true,
//       message: 'Supplier updated successfully',
//       data: updated
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Delete supplier
// router.delete('/suppliers/:id', (req, res) => {
//   try {
//     const { id } = req.params;
//     const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);

//     if (!supplier) {
//       return res.status(404).json({ error: 'Supplier not found' });
//     }

//     // Delete supplier ledger entries
//     db.prepare('DELETE FROM supplier_ledger WHERE supplier_name = ?').run(supplier.name);

//     // Delete supplier
//     db.prepare('DELETE FROM suppliers WHERE id = ?').run(id);

//     res.json({ success: true, message: 'Supplier deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Add payment to supplier (debit entry)
// router.post('/suppliers/:id/payment', (req, res) => {
//   const { id } = req.params;
//   const { amount, date, description } = req.body;

//   try {
//     if (!amount || parseFloat(amount) <= 0) {
//       return res.status(400).json({ error: 'Valid amount is required' });
//     }

//     const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
//     if (!supplier) {
//       return res.status(404).json({ error: 'Supplier not found' });
//     }

//     // Add debit entry (payment made to supplier)
//     const result = db.prepare(`
//       INSERT INTO supplier_ledger (supplier_name, date, description, weight, rate, debit, credit)
//       VALUES (?, ?, ?, ?, ?, ?, ?)
//     `).run(
//       supplier.name,
//       date || new Date().toISOString().split('T')[0],
//       description || 'Payment Made',
//       '-',
//       '-',
//       parseFloat(amount),
//       0
//     );

//     const newEntry = db.prepare('SELECT * FROM supplier_ledger WHERE id = ?').get(result.lastInsertRowid);

//     res.json({
//       success: true,
//       message: `Payment of $${amount} made to ${supplier.name}`,
//       data: newEntry
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Add MANUAL ledger entry (Credit/Debit) for Supplier
// router.post('/suppliers/:id/ledger', (req, res) => {
//   const { id } = req.params;
//   const { date, description, amount, type } = req.body; // type: 'credit' or 'debit'

//   try {
//     if (!amount || parseFloat(amount) <= 0) {
//       return res.status(400).json({ error: 'Valid amount is required' });
//     }

//     const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
//     if (!supplier) {
//       return res.status(404).json({ error: 'Supplier not found' });
//     }

//     const creditVal = type === 'credit' ? parseFloat(amount) : 0;
//     const debitVal = type === 'debit' ? parseFloat(amount) : 0;

//     const result = db.prepare(`
//       INSERT INTO supplier_ledger (supplier_name, date, description, weight, rate, debit, credit)
//       VALUES (?, ?, ?, ?, ?, ?, ?)
//     `).run(
//       supplier.name,
//       date || new Date().toISOString().split('T')[0],
//       description || 'Manual Adjustment',
//       '-',
//       '-',
//       debitVal,
//       creditVal
//     );

//     const newEntry = db.prepare('SELECT * FROM supplier_ledger WHERE id = ?').get(result.lastInsertRowid);

//     res.json({
//       success: true,
//       message: 'Ledger entry added successfully',
//       data: newEntry
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Update supplier ledger entry
// router.put('/suppliers/ledger/:ledgerId', (req, res) => {
//   const { ledgerId } = req.params;
//   const { date, description, weight, rate, debit, credit } = req.body;

//   try {
//     const entry = db.prepare('SELECT * FROM supplier_ledger WHERE id = ?').get(ledgerId);
//     if (!entry) {
//       return res.status(404).json({ error: 'Ledger entry not found' });
//     }

//     db.prepare(`
//       UPDATE supplier_ledger 
//       SET date = ?, description = ?, weight = ?, rate = ?, debit = ?, credit = ?
//       WHERE id = ?
//     `).run(
//       date || entry.date,
//       description || entry.description,
//       weight !== undefined ? weight : entry.weight,
//       rate !== undefined ? rate : entry.rate,
//       debit !== undefined ? parseFloat(debit) : entry.debit,
//       credit !== undefined ? parseFloat(credit) : entry.credit,
//       ledgerId
//     );

//     const updated = db.prepare('SELECT * FROM supplier_ledger WHERE id = ?').get(ledgerId);

//     res.json({
//       success: true,
//       message: 'Ledger entry updated successfully',
//       data: updated
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Delete supplier ledger entry
// router.delete('/suppliers/ledger/:ledgerId', (req, res) => {
//   const { ledgerId } = req.params;

//   try {
//     const entry = db.prepare('SELECT * FROM supplier_ledger WHERE id = ?').get(ledgerId);
//     if (!entry) {
//       return res.status(404).json({ error: 'Ledger entry not found' });
//     }

//     db.prepare('DELETE FROM supplier_ledger WHERE id = ?').run(ledgerId);

//     res.json({
//       success: true,
//       message: 'Ledger entry deleted successfully'
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // ============ CUSTOMER ROUTES ============

// // Get all customers with their ledgers
// router.get('/customers', (req, res) => {
//   try {
//     const customers = db.prepare(`
//       SELECT id, name, phone, city 
//       FROM customers 
//       ORDER BY name ASC
//     `).all();

//     // Get ledger for each customer
//     const customersWithLedger = customers.map(customer => {
//       const ledger = db.prepare(`
//         SELECT * FROM customer_ledger 
//         WHERE customer_name = ? 
//         ORDER BY date DESC, id DESC
//       `).all(customer.name);

//       return {
//         ...customer,
//         ledger
//       };
//     });

//     res.json(customersWithLedger);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get single customer with ledger
// router.get('/customers/:id', (req, res) => {
//   try {
//     const { id } = req.params;
//     const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);

//     if (!customer) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }

//     const ledger = db.prepare(`
//       SELECT * FROM customer_ledger 
//       WHERE customer_name = ? 
//       ORDER BY date DESC, id DESC
//     `).all(customer.name);

//     res.json({ ...customer, ledger });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Add new customer
// router.post('/customers', (req, res) => {
//   const { name, phone, city } = req.body;

//   try {
//     if (!name || !name.trim()) {
//       return res.status(400).json({ error: 'Customer name is required' });
//     }

//     // Check if customer already exists
//     const existing = db.prepare('SELECT * FROM customers WHERE name = ?').get(name.trim());
//     if (existing) {
//       return res.status(400).json({ error: 'Customer with this name already exists' });
//     }

//     const result = db.prepare(`
//       INSERT INTO customers (name, phone, city)
//       VALUES (?, ?, ?)
//     `).run(name.trim(), phone || '', city || '');

//     const newCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);

//     res.json({
//       success: true,
//       message: 'Customer added successfully',
//       data: { ...newCustomer, ledger: [] }
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Update customer
// router.put('/customers/:id', (req, res) => {
//   const { id } = req.params;
//   const { name, phone, city } = req.body;

//   try {
//     const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
//     if (!customer) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }

//     db.prepare(`
//       UPDATE customers 
//       SET name = ?, phone = ?, city = ?
//       WHERE id = ?
//     `).run(name || customer.name, phone || customer.phone, city || customer.city, id);

//     const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);

//     res.json({
//       success: true,
//       message: 'Customer updated successfully',
//       data: updated
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Delete customer
// router.delete('/customers/:id', (req, res) => {
//   try {
//     const { id } = req.params;
//     const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);

//     if (!customer) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }

//     // Delete customer ledger entries
//     db.prepare('DELETE FROM customer_ledger WHERE customer_name = ?').run(customer.name);

//     // Delete customer
//     db.prepare('DELETE FROM customers WHERE id = ?').run(id);

//     res.json({ success: true, message: 'Customer deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Receive payment from customer (credit entry)
// router.post('/customers/:id/payment', (req, res) => {
//   const { id } = req.params;
//   const { amount, date, description } = req.body;

//   try {
//     if (!amount || parseFloat(amount) <= 0) {
//       return res.status(400).json({ error: 'Valid amount is required' });
//     }

//     const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
//     if (!customer) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }

//     // Add credit entry (payment received from customer)
//     const result = db.prepare(`
//       INSERT INTO customer_ledger (customer_name, date, description, weight, rate, debit, credit)
//       VALUES (?, ?, ?, ?, ?, ?, ?)
//     `).run(
//       customer.name,
//       date || new Date().toISOString().split('T')[0],
//       description || 'Payment Received',
//       '-',
//       '-',
//       0,
//       parseFloat(amount)
//     );

//     const newEntry = db.prepare('SELECT * FROM customer_ledger WHERE id = ?').get(result.lastInsertRowid);

//     res.json({
//       success: true,
//       message: `Payment of $${amount} received from ${customer.name}`,
//       data: newEntry
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Add MANUAL ledger entry (Debit/Credit) for Customer
// router.post('/customers/:id/ledger', (req, res) => {
//   const { id } = req.params;
//   const { date, description, amount, type } = req.body; // type: 'debit' or 'credit'

//   try {
//     if (!amount || parseFloat(amount) <= 0) {
//       return res.status(400).json({ error: 'Valid amount is required' });
//     }

//     const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
//     if (!customer) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }

//     const debitVal = type === 'debit' ? parseFloat(amount) : 0;
//     const creditVal = type === 'credit' ? parseFloat(amount) : 0;

//     const result = db.prepare(`
//       INSERT INTO customer_ledger (customer_name, date, description, weight, rate, debit, credit)
//       VALUES (?, ?, ?, ?, ?, ?, ?)
//     `).run(
//       customer.name,
//       date || new Date().toISOString().split('T')[0],
//       description || 'Manual Adjustment',
//       '-',
//       '-',
//       debitVal,
//       creditVal
//     );

//     const newEntry = db.prepare('SELECT * FROM customer_ledger WHERE id = ?').get(result.lastInsertRowid);

//     res.json({
//       success: true,
//       message: 'Ledger entry added successfully',
//       data: newEntry
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Update customer ledger entry
// router.put('/customers/ledger/:ledgerId', (req, res) => {
//   const { ledgerId } = req.params;
//   const { date, description, weight, rate, debit, credit } = req.body;

//   try {
//     const entry = db.prepare('SELECT * FROM customer_ledger WHERE id = ?').get(ledgerId);
//     if (!entry) {
//       return res.status(404).json({ error: 'Ledger entry not found' });
//     }

//     db.prepare(`
//       UPDATE customer_ledger 
//       SET date = ?, description = ?, weight = ?, rate = ?, debit = ?, credit = ?
//       WHERE id = ?
//     `).run(
//       date || entry.date,
//       description || entry.description,
//       weight !== undefined ? weight : entry.weight,
//       rate !== undefined ? rate : entry.rate,
//       debit !== undefined ? parseFloat(debit) : entry.debit,
//       credit !== undefined ? parseFloat(credit) : entry.credit,
//       ledgerId
//     );

//     const updated = db.prepare('SELECT * FROM customer_ledger WHERE id = ?').get(ledgerId);

//     res.json({
//       success: true,
//       message: 'Ledger entry updated successfully',
//       data: updated
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Delete customer ledger entry
// router.delete('/customers/ledger/:ledgerId', (req, res) => {
//   const { ledgerId } = req.params;

//   try {
//     const entry = db.prepare('SELECT * FROM customer_ledger WHERE id = ?').get(ledgerId);
//     if (!entry) {
//       return res.status(404).json({ error: 'Ledger entry not found' });
//     }

//     db.prepare('DELETE FROM customer_ledger WHERE id = ?').run(ledgerId);

//     res.json({
//       success: true,
//       message: 'Ledger entry deleted successfully'
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // ============ BALANCE CALCULATION ROUTES ============

// // Get supplier balance
// router.get('/suppliers/:id/balance', (req, res) => {
//   try {
//     const { id } = req.params;
//     const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);

//     if (!supplier) {
//       return res.status(404).json({ error: 'Supplier not found' });
//     }

//     const totals = db.prepare(`
//       SELECT 
//         SUM(debit) as total_debit,
//         SUM(credit) as total_credit
//       FROM supplier_ledger
//       WHERE supplier_name = ?
//     `).get(supplier.name);

//     const totalDebit = totals.total_debit || 0;
//     const totalCredit = totals.total_credit || 0;
//     const balance = totalCredit - totalDebit; // Positive = we owe supplier

//     res.json({
//       supplier_name: supplier.name,
//       total_debit: totalDebit,
//       total_credit: totalCredit,
//       balance: balance,
//       status: balance >= 0 ? 'payable' : 'paid'
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get customer balance
// router.get('/customers/:id/balance', (req, res) => {
//   try {
//     const { id } = req.params;
//     const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);

//     if (!customer) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }

//     const totals = db.prepare(`
//       SELECT 
//         SUM(debit) as total_debit,
//         SUM(credit) as total_credit
//       FROM customer_ledger
//       WHERE customer_name = ?
//     `).get(customer.name);

//     const totalDebit = totals.total_debit || 0;
//     const totalCredit = totals.total_credit || 0;
//     const balance = totalDebit - totalCredit; // Positive = customer owes us

//     res.json({
//       customer_name: customer.name,
//       total_debit: totalDebit,
//       total_credit: totalCredit,
//       balance: balance,
//       status: balance >= 0 ? 'receivable' : 'payable'
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// export default router;

const router = _express.default.Router();

// ============ SUPPLIER ROUTES ============

// Get all suppliers with their ledgers
router.get('/suppliers', (req, res) => {
  try {
    const suppliers = _database.default.prepare(`
      SELECT id, name, phone, city 
      FROM suppliers 
      ORDER BY name ASC
    `).all();

    // Get ledger for each supplier
    const suppliersWithLedger = suppliers.map(supplier => {
      const ledger = _database.default.prepare(`
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
    res.status(500).json({
      error: error.message
    });
  }
});

// Get single supplier with ledger
router.get('/suppliers/:id', (req, res) => {
  try {
    const {
      id
    } = req.params;
    const supplier = _database.default.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    if (!supplier) {
      return res.status(404).json({
        error: 'Supplier not found'
      });
    }
    const ledger = _database.default.prepare(`
      SELECT * FROM supplier_ledger 
      WHERE supplier_name = ? 
      ORDER BY date DESC, id DESC
    `).all(supplier.name);
    res.json({
      ...supplier,
      ledger
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Add new supplier
router.post('/suppliers', (req, res) => {
  const {
    name,
    phone,
    city
  } = req.body;
  try {
    if (!name || !name.trim()) {
      return res.status(400).json({
        error: 'Supplier name is required'
      });
    }

    // Check if supplier already exists
    const existing = _database.default.prepare('SELECT * FROM suppliers WHERE name = ?').get(name.trim());
    if (existing) {
      return res.status(400).json({
        error: 'Supplier with this name already exists'
      });
    }
    const result = _database.default.prepare(`
      INSERT INTO suppliers (name, phone, city)
      VALUES (?, ?, ?)
    `).run(name.trim(), phone || '', city || '');
    const newSupplier = _database.default.prepare('SELECT * FROM suppliers WHERE id = ?').get(result.lastInsertRowid);
    res.json({
      success: true,
      message: 'Supplier added successfully',
      data: {
        ...newSupplier,
        ledger: []
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Update supplier
router.put('/suppliers/:id', (req, res) => {
  const {
    id
  } = req.params;
  const {
    name,
    phone,
    city
  } = req.body;
  try {
    const supplier = _database.default.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    if (!supplier) {
      return res.status(404).json({
        error: 'Supplier not found'
      });
    }
    _database.default.prepare(`
      UPDATE suppliers 
      SET name = ?, phone = ?, city = ?
      WHERE id = ?
    `).run(name || supplier.name, phone || supplier.phone, city || supplier.city, id);
    const updated = _database.default.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Delete supplier
router.delete('/suppliers/:id', (req, res) => {
  try {
    const {
      id
    } = req.params;
    const supplier = _database.default.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    if (!supplier) {
      return res.status(404).json({
        error: 'Supplier not found'
      });
    }

    // Delete supplier ledger entries
    _database.default.prepare('DELETE FROM supplier_ledger WHERE supplier_name = ?').run(supplier.name);

    // Delete supplier
    _database.default.prepare('DELETE FROM suppliers WHERE id = ?').run(id);
    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Add payment to supplier (debit entry)
router.post('/suppliers/:id/payment', (req, res) => {
  const {
    id
  } = req.params;
  const {
    amount,
    date,
    description
  } = req.body;
  try {
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({
        error: 'Valid amount is required'
      });
    }
    const supplier = _database.default.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    if (!supplier) {
      return res.status(404).json({
        error: 'Supplier not found'
      });
    }

    // Add debit entry (payment made to supplier)
    const result = _database.default.prepare(`
      INSERT INTO supplier_ledger (supplier_name, date, description, weight, rate, debit, credit)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(supplier.name, date || new Date().toISOString().split('T')[0], description || 'Payment Made', '-', '-', parseFloat(amount), 0);
    const newEntry = _database.default.prepare('SELECT * FROM supplier_ledger WHERE id = ?').get(result.lastInsertRowid);
    res.json({
      success: true,
      message: `Payment of $${amount} made to ${supplier.name}`,
      data: newEntry
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Add MANUAL ledger entry (Credit/Debit) for Supplier
router.post('/suppliers/:id/ledger', (req, res) => {
  const {
    id
  } = req.params;
  const {
    date,
    description,
    amount,
    type
  } = req.body; // type: 'credit' or 'debit'

  try {
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({
        error: 'Valid amount is required'
      });
    }
    const supplier = _database.default.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    if (!supplier) {
      return res.status(404).json({
        error: 'Supplier not found'
      });
    }
    const creditVal = type === 'credit' ? parseFloat(amount) : 0;
    const debitVal = type === 'debit' ? parseFloat(amount) : 0;
    const result = _database.default.prepare(`
      INSERT INTO supplier_ledger (supplier_name, date, description, weight, rate, debit, credit)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(supplier.name, date || new Date().toISOString().split('T')[0], description || 'Manual Adjustment', '-', '-', debitVal, creditVal);
    const newEntry = _database.default.prepare('SELECT * FROM supplier_ledger WHERE id = ?').get(result.lastInsertRowid);
    res.json({
      success: true,
      message: 'Ledger entry added successfully',
      data: newEntry
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Update supplier ledger entry
router.put('/suppliers/ledger/:ledgerId', (req, res) => {
  const {
    ledgerId
  } = req.params;
  const {
    date,
    description,
    weight,
    rate,
    debit,
    credit
  } = req.body;
  try {
    const entry = _database.default.prepare('SELECT * FROM supplier_ledger WHERE id = ?').get(ledgerId);
    if (!entry) {
      return res.status(404).json({
        error: 'Ledger entry not found'
      });
    }
    _database.default.prepare(`
      UPDATE supplier_ledger 
      SET date = ?, description = ?, weight = ?, rate = ?, debit = ?, credit = ?
      WHERE id = ?
    `).run(date || entry.date, description || entry.description, weight !== undefined ? weight : entry.weight, rate !== undefined ? rate : entry.rate, debit !== undefined ? parseFloat(debit) : entry.debit, credit !== undefined ? parseFloat(credit) : entry.credit, ledgerId);
    const updated = _database.default.prepare('SELECT * FROM supplier_ledger WHERE id = ?').get(ledgerId);
    res.json({
      success: true,
      message: 'Ledger entry updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Delete supplier ledger entry
router.delete('/suppliers/ledger/:ledgerId', (req, res) => {
  const {
    ledgerId
  } = req.params;
  try {
    const entry = _database.default.prepare('SELECT * FROM supplier_ledger WHERE id = ?').get(ledgerId);
    if (!entry) {
      return res.status(404).json({
        error: 'Ledger entry not found'
      });
    }
    _database.default.prepare('DELETE FROM supplier_ledger WHERE id = ?').run(ledgerId);
    res.json({
      success: true,
      message: 'Ledger entry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// ============ CUSTOMER ROUTES ============

// Get all customers with their ledgers
router.get('/customers', (req, res) => {
  try {
    const customers = _database.default.prepare(`
      SELECT id, name, phone, city 
      FROM customers 
      ORDER BY name ASC
    `).all();

    // Get ledger for each customer
    const customersWithLedger = customers.map(customer => {
      const ledger = _database.default.prepare(`
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
    res.status(500).json({
      error: error.message
    });
  }
});

// Get single customer with ledger
router.get('/customers/:id', (req, res) => {
  try {
    const {
      id
    } = req.params;
    const customer = _database.default.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }
    const ledger = _database.default.prepare(`
      SELECT * FROM customer_ledger 
      WHERE customer_name = ? 
      ORDER BY date DESC, id DESC
    `).all(customer.name);
    res.json({
      ...customer,
      ledger
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Add new customer
router.post('/customers', (req, res) => {
  const {
    name,
    phone,
    city
  } = req.body;
  try {
    if (!name || !name.trim()) {
      return res.status(400).json({
        error: 'Customer name is required'
      });
    }

    // Check if customer already exists
    const existing = _database.default.prepare('SELECT * FROM customers WHERE name = ?').get(name.trim());
    if (existing) {
      return res.status(400).json({
        error: 'Customer with this name already exists'
      });
    }
    const result = _database.default.prepare(`
      INSERT INTO customers (name, phone, city)
      VALUES (?, ?, ?)
    `).run(name.trim(), phone || '', city || '');
    const newCustomer = _database.default.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
    res.json({
      success: true,
      message: 'Customer added successfully',
      data: {
        ...newCustomer,
        ledger: []
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Update customer
router.put('/customers/:id', (req, res) => {
  const {
    id
  } = req.params;
  const {
    name,
    phone,
    city
  } = req.body;
  try {
    const customer = _database.default.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }
    _database.default.prepare(`
      UPDATE customers 
      SET name = ?, phone = ?, city = ?
      WHERE id = ?
    `).run(name || customer.name, phone || customer.phone, city || customer.city, id);
    const updated = _database.default.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Delete customer
router.delete('/customers/:id', (req, res) => {
  try {
    const {
      id
    } = req.params;
    const customer = _database.default.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    // Delete customer ledger entries
    _database.default.prepare('DELETE FROM customer_ledger WHERE customer_name = ?').run(customer.name);

    // Delete customer
    _database.default.prepare('DELETE FROM customers WHERE id = ?').run(id);
    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Receive payment from customer (credit entry)
router.post('/customers/:id/payment', (req, res) => {
  const {
    id
  } = req.params;
  const {
    amount,
    date,
    description
  } = req.body;
  try {
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({
        error: 'Valid amount is required'
      });
    }
    const customer = _database.default.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    // Add credit entry (payment received from customer)
    const result = _database.default.prepare(`
      INSERT INTO customer_ledger (customer_name, date, description, weight, rate, debit, credit)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(customer.name, date || new Date().toISOString().split('T')[0], description || 'Payment Received', '-', '-', 0, parseFloat(amount));
    const newEntry = _database.default.prepare('SELECT * FROM customer_ledger WHERE id = ?').get(result.lastInsertRowid);
    res.json({
      success: true,
      message: `Payment of $${amount} received from ${customer.name}`,
      data: newEntry
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Add MANUAL ledger entry (Debit/Credit) for Customer
router.post('/customers/:id/ledger', (req, res) => {
  const {
    id
  } = req.params;
  const {
    date,
    description,
    amount,
    type
  } = req.body; // type: 'debit' or 'credit'

  try {
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({
        error: 'Valid amount is required'
      });
    }
    const customer = _database.default.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }
    const debitVal = type === 'debit' ? parseFloat(amount) : 0;
    const creditVal = type === 'credit' ? parseFloat(amount) : 0;
    const result = _database.default.prepare(`
      INSERT INTO customer_ledger (customer_name, date, description, weight, rate, debit, credit)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(customer.name, date || new Date().toISOString().split('T')[0], description || 'Manual Adjustment', '-', '-', debitVal, creditVal);
    const newEntry = _database.default.prepare('SELECT * FROM customer_ledger WHERE id = ?').get(result.lastInsertRowid);
    res.json({
      success: true,
      message: 'Ledger entry added successfully',
      data: newEntry
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Update customer ledger entry
router.put('/customers/ledger/:ledgerId', (req, res) => {
  const {
    ledgerId
  } = req.params;
  const {
    date,
    description,
    weight,
    rate,
    debit,
    credit
  } = req.body;
  try {
    const entry = _database.default.prepare('SELECT * FROM customer_ledger WHERE id = ?').get(ledgerId);
    if (!entry) {
      return res.status(404).json({
        error: 'Ledger entry not found'
      });
    }
    _database.default.prepare(`
      UPDATE customer_ledger 
      SET date = ?, description = ?, weight = ?, rate = ?, debit = ?, credit = ?
      WHERE id = ?
    `).run(date || entry.date, description || entry.description, weight !== undefined ? weight : entry.weight, rate !== undefined ? rate : entry.rate, debit !== undefined ? parseFloat(debit) : entry.debit, credit !== undefined ? parseFloat(credit) : entry.credit, ledgerId);
    const updated = _database.default.prepare('SELECT * FROM customer_ledger WHERE id = ?').get(ledgerId);
    res.json({
      success: true,
      message: 'Ledger entry updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Delete customer ledger entry
router.delete('/customers/ledger/:ledgerId', (req, res) => {
  const {
    ledgerId
  } = req.params;
  try {
    const entry = _database.default.prepare('SELECT * FROM customer_ledger WHERE id = ?').get(ledgerId);
    if (!entry) {
      return res.status(404).json({
        error: 'Ledger entry not found'
      });
    }
    _database.default.prepare('DELETE FROM customer_ledger WHERE id = ?').run(ledgerId);
    res.json({
      success: true,
      message: 'Ledger entry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// ============ BALANCE CALCULATION ROUTES ============

// Get supplier balance
router.get('/suppliers/:id/balance', (req, res) => {
  try {
    const {
      id
    } = req.params;
    const supplier = _database.default.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    if (!supplier) {
      return res.status(404).json({
        error: 'Supplier not found'
      });
    }
    const totals = _database.default.prepare(`
      SELECT 
        SUM(debit) as total_debit,
        SUM(credit) as total_credit
      FROM supplier_ledger
      WHERE supplier_name = ?
    `).get(supplier.name);
    const totalDebit = totals.total_debit || 0;
    const totalCredit = totals.total_credit || 0;
    const balance = totalCredit - totalDebit; // Positive = we owe supplier

    res.json({
      supplier_name: supplier.name,
      total_debit: totalDebit,
      total_credit: totalCredit,
      balance: balance,
      status: balance >= 0 ? 'payable' : 'paid'
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Get customer balance
router.get('/customers/:id/balance', (req, res) => {
  try {
    const {
      id
    } = req.params;
    const customer = _database.default.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }
    const totals = _database.default.prepare(`
      SELECT 
        SUM(debit) as total_debit,
        SUM(credit) as total_credit
      FROM customer_ledger
      WHERE customer_name = ?
    `).get(customer.name);
    const totalDebit = totals.total_debit || 0;
    const totalCredit = totals.total_credit || 0;
    const balance = totalDebit - totalCredit; // Positive = customer owes us

    res.json({
      customer_name: customer.name,
      total_debit: totalDebit,
      total_credit: totalCredit,
      balance: balance,
      status: balance >= 0 ? 'receivable' : 'payable'
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// ============ CONTRA SETTLEMENT ROUTE (NEW) ============

router.post('/contra/settle', (req, res) => {
  const {
    customerId,
    supplierId,
    amount,
    date,
    weight,
    rate,
    description
  } = req.body;
  try {
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({
        error: 'Valid amount is required'
      });
    }

    // 1. Get Names
    const customer = _database.default.prepare('SELECT name FROM customers WHERE id = ?').get(customerId);
    const supplier = _database.default.prepare('SELECT name FROM suppliers WHERE id = ?').get(supplierId);
    if (!customer || !supplier) {
      return res.status(404).json({
        error: 'Customer or Supplier not found'
      });
    }

    // 2. Define the Reason (The "Why")
    // If user provided a description, use it. Otherwise generate a default one.
    const finalDesc = description && description.trim() !== "" ? description : `Contra Settlement: Offset between ${customer.name} & ${supplier.name}`;

    // 3. START TRANSACTION (Ensures both happen or neither happens)
    const contraTransaction = _database.default.transaction(() => {
      // A. Update Customer Ledger (CREDIT = Reduces Receivable)
      _database.default.prepare(`
        INSERT INTO customer_ledger (customer_name, date, description, weight, rate, debit, credit)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(customer.name, date, finalDesc,
      // The "Why"
      weight || '-',
      // Optional Weight
      rate || '-',
      // Optional Rate
      0, parseFloat(amount) // Credit
      );

      // B. Update Supplier Ledger (DEBIT = Reduces Payable)
      _database.default.prepare(`
        INSERT INTO supplier_ledger (supplier_name, date, description, weight, rate, debit, credit)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(supplier.name, date, finalDesc,
      // The "Why"
      weight || '-',
      // Optional Weight
      rate || '-',
      // Optional Rate
      parseFloat(amount),
      // Debit
      0);
    });

    // 4. Execute
    contraTransaction();
    res.json({
      success: true,
      message: 'Contra settlement successful'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message
    });
  }
});
var _default = exports.default = router;