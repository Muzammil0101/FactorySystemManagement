"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _database = _interopRequireDefault(require("../database/database.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// import express from 'express';
// import db from '../database/database.js';

// const router = express.Router();

// // Initialize table for manual cash hand (Run once)
// try {
//   db.prepare(`
//     CREATE TABLE IF NOT EXISTS cash_hand (
//       id INTEGER PRIMARY KEY CHECK (id = 1),
//       amount REAL DEFAULT 0
//     )
//   `).run();

//   // Ensure the single row exists
//   db.prepare(`INSERT OR IGNORE INTO cash_hand (id, amount) VALUES (1, 0)`).run();
// } catch (error) {
//   console.error("Error initializing cash_hand table:", error);
// }

// // ============ PROFIT & LOSS / BALANCE SHEET ROUTES ============

// // Update Manual Cash In Hand
// router.post('/profit-loss/cash-in-hand', (req, res) => {
//   const { amount } = req.body;
//   try {
//     db.prepare('UPDATE cash_hand SET amount = ? WHERE id = 1').run(amount || 0);
//     res.json({ success: true, message: 'Cash in hand updated', amount });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // 1. Balance Sheet Calculation (UPDATED: Uses Purchase Rate for Stock Value)
// router.get('/profit-loss/balance-sheet', (req, res) => {
//   try {
//     // --- 1. Cash Flow (Cash In Hand) ---
//     const cashRecord = db.prepare('SELECT amount FROM cash_hand WHERE id = 1').get();
//     const cashInHand = cashRecord ? cashRecord.amount : 0;

//     // --- 2. Remaining Stock Amount (UPDATED) ---
//     // Logic: (Total Weight In - Total Weight Out) * Average PURCHASE Rate

//     // Get total stock in weight AND amount (Total Cost)
//     const stockIn = db.prepare('SELECT SUM(weight) as weight, SUM(amount) as amount FROM stock_in').get();

//     // Get total stock out weight (to calculate remaining weight)
//     const stockOut = db.prepare('SELECT SUM(weight) as weight FROM stock_out').get();

//     const totalInWeight = stockIn.weight || 0;
//     const totalInAmount = stockIn.amount || 0; // Total Cost of all purchases

//     const totalOutWeight = stockOut.weight || 0;

//     // Calculate weighted average PURCHASE rate
//     // Formula: Total Cost / Total Weight Bought
//     const avgPurchaseRate = totalInWeight > 0 ? totalInAmount / totalInWeight : 0;

//     const remainingWeight = totalInWeight - totalOutWeight;

//     // Valuing remaining stock at the Purchase Rate (Cost Price)
//     // This gives a more conservative/realistic asset value than sale price
//     const stockValue = remainingWeight * avgPurchaseRate;

//     // --- 3. Customer Balances (Column 1 List) ---
//     // Get all customers and their current balance (Debit - Credit)
//     // Positive means they owe us (Asset)
//     const customers = db.prepare('SELECT name FROM customers').all();
//     const customerList = customers.map(c => {
//       const ledger = db.prepare('SELECT SUM(debit) as d, SUM(credit) as c FROM customer_ledger WHERE customer_name = ?').get(c.name);
//       const debit = ledger.d || 0;
//       const credit = ledger.c || 0;
//       return { 
//         name: c.name, 
//         balance: debit - credit 
//       };
//     }).filter(c => Math.abs(c.balance) > 0);

//     // --- 4. Supplier Balances (Column 2 List) ---
//     // Get all suppliers and their current balance (Credit - Debit)
//     // Positive means we owe them (Liability)
//     const suppliers = db.prepare('SELECT name FROM suppliers').all();
//     const supplierList = suppliers.map(s => {
//       const ledger = db.prepare('SELECT SUM(credit) as c, SUM(debit) as d FROM supplier_ledger WHERE supplier_name = ?').get(s.name);
//       const credit = ledger.c || 0;
//       const debit = ledger.d || 0;
//       return { 
//         name: s.name, 
//         balance: credit - debit 
//       };
//     }).filter(s => Math.abs(s.balance) > 0);

//     res.json({
//       cash_in_hand: parseFloat(cashInHand.toFixed(2)),
//       stock_value: parseFloat(stockValue.toFixed(2)),
//       stock_weight: parseFloat(remainingWeight.toFixed(2)),
//       avg_purchase_rate_used: parseFloat(avgPurchaseRate.toFixed(2)), 
//       customers: customerList,
//       suppliers: supplierList
//     });

//   } catch (error) {
//     console.error("Balance Sheet Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Overall P&L Summary (Standard)
// router.get('/profit-loss/summary', (req, res) => {
//   try {
//     const totalIn = db.prepare(`
//       SELECT SUM(amount) as total_cost FROM stock_in
//     `).get();

//     const totalOut = db.prepare(`
//       SELECT SUM(amount) as total_revenue FROM stock_out
//     `).get();

//     const totalCost = totalIn.total_cost || 0;
//     const totalRevenue = totalOut.total_revenue || 0;
//     const profitLoss = totalRevenue - totalCost;
//     const margin = totalCost > 0 ? ((profitLoss / totalCost) * 100).toFixed(2) : 0;

//     res.json({
//       total_cost: parseFloat(totalCost.toFixed(2)),
//       total_revenue: parseFloat(totalRevenue.toFixed(2)),
//       profit_loss: parseFloat(profitLoss.toFixed(2)),
//       profit_margin_percent: parseFloat(margin),
//       status: profitLoss >= 0 ? 'profitable' : 'loss'
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // P&L by Category
// router.get('/profit-loss/by-category', (req, res) => {
//   try {
//     const categories = db.prepare(`
//       SELECT DISTINCT description FROM stock_in
//       UNION
//       SELECT DISTINCT description FROM stock_out
//       ORDER BY description ASC
//     `).all();

//     const results = categories.map(cat => {
//       const inData = db.prepare(`
//         SELECT SUM(amount) as total FROM stock_in WHERE description = ?
//       `).get(cat.description);

//       const outData = db.prepare(`
//         SELECT SUM(amount) as total FROM stock_out WHERE description = ?
//       `).get(cat.description);

//       const cost = inData.total || 0;
//       const revenue = outData.total || 0;
//       const profitLoss = revenue - cost;
//       const margin = cost > 0 ? ((profitLoss / cost) * 100).toFixed(2) : 0;

//       return {
//         category: cat.description,
//         cost: parseFloat(cost.toFixed(2)),
//         revenue: parseFloat(revenue.toFixed(2)),
//         profit_loss: parseFloat(profitLoss.toFixed(2)),
//         margin_percent: parseFloat(margin)
//       };
//     });

//     res.json(results);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // P&L by Date Range
// router.get('/profit-loss/by-date-range', (req, res) => {
//   const { start_date, end_date } = req.query;

//   try {
//     if (!start_date || !end_date) {
//       return res.status(400).json({ error: 'start_date and end_date are required (YYYY-MM-DD)' });
//     }

//     const inData = db.prepare(`
//       SELECT SUM(amount) as total FROM stock_in 
//       WHERE date >= ? AND date <= ?
//     `).get(start_date, end_date);

//     const outData = db.prepare(`
//       SELECT SUM(amount) as total FROM stock_out 
//       WHERE date >= ? AND date <= ?
//     `).get(start_date, end_date);

//     const cost = inData.total || 0;
//     const revenue = outData.total || 0;
//     const profitLoss = revenue - cost;
//     const margin = cost > 0 ? ((profitLoss / cost) * 100).toFixed(2) : 0;

//     res.json({
//       period: `${start_date} to ${end_date}`,
//       cost: parseFloat(cost.toFixed(2)),
//       revenue: parseFloat(revenue.toFixed(2)),
//       profit_loss: parseFloat(profitLoss.toFixed(2)),
//       margin_percent: parseFloat(margin)
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // P&L by Supplier (Cost Analysis)
// router.get('/profit-loss/by-supplier', (req, res) => {
//   try {
//     const suppliers = db.prepare(`
//       SELECT DISTINCT supplier FROM stock_in ORDER BY supplier ASC
//     `).all();

//     const results = suppliers.map(sup => {
//       const costData = db.prepare(`
//         SELECT SUM(amount) as total, SUM(weight) as qty FROM stock_in 
//         WHERE supplier = ?
//       `).get(sup.supplier);

//       const cost = costData.total || 0;
//       const qty = costData.qty || 0;
//       const avgRate = qty > 0 ? (cost / qty).toFixed(2) : 0;

//       return {
//         supplier: sup.supplier,
//         total_cost: parseFloat(cost.toFixed(2)),
//         total_quantity: parseFloat(qty.toFixed(2)),
//         avg_rate_per_unit: parseFloat(avgRate)
//       };
//     });

//     res.json(results);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // P&L by Customer (Revenue Analysis)
// router.get('/profit-loss/by-customer', (req, res) => {
//   try {
//     const customers = db.prepare(`
//       SELECT DISTINCT customer FROM stock_out ORDER BY customer ASC
//     `).all();

//     const results = customers.map(cust => {
//       const revenueData = db.prepare(`
//         SELECT SUM(amount) as total, SUM(weight) as qty FROM stock_out 
//         WHERE customer = ?
//       `).get(cust.customer);

//       const revenue = revenueData.total || 0;
//       const qty = revenueData.qty || 0;
//       const avgRate = qty > 0 ? (revenue / qty).toFixed(2) : 0;

//       return {
//         customer: cust.customer,
//         total_revenue: parseFloat(revenue.toFixed(2)),
//         total_quantity: parseFloat(qty.toFixed(2)),
//         avg_rate_per_unit: parseFloat(avgRate)
//       };
//     });

//     res.json(results);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Detailed P&L Report
// router.get('/profit-loss/detailed-report', (req, res) => {
//   try {
//     const inData = db.prepare(`
//       SELECT 
//         COUNT(*) as transaction_count,
//         SUM(amount) as total_amount,
//         SUM(weight) as total_weight,
//         AVG(rate) as avg_rate
//       FROM stock_in
//     `).get();

//     const outData = db.prepare(`
//       SELECT 
//         COUNT(*) as transaction_count,
//         SUM(amount) as total_amount,
//         SUM(weight) as total_weight,
//         AVG(rate) as avg_rate
//       FROM stock_out
//     `).get();

//     const totalCost = inData.total_amount || 0;
//     const totalRevenue = outData.total_amount || 0;
//     const profitLoss = totalRevenue - totalCost;
//     const margin = totalCost > 0 ? ((profitLoss / totalCost) * 100).toFixed(2) : 0;

//     res.json({
//       summary: {
//         total_cost: parseFloat(totalCost.toFixed(2)),
//         total_revenue: parseFloat(totalRevenue.toFixed(2)),
//         profit_loss: parseFloat(profitLoss.toFixed(2)),
//         profit_margin_percent: parseFloat(margin),
//         status: profitLoss >= 0 ? 'profitable' : 'loss'
//       },
//       purchases: {
//         transaction_count: inData.transaction_count || 0,
//         total_amount: parseFloat((inData.total_amount || 0).toFixed(2)),
//         total_weight: parseFloat((inData.total_weight || 0).toFixed(2)),
//         avg_rate: parseFloat((inData.avg_rate || 0).toFixed(2))
//       },
//       sales: {
//         transaction_count: outData.transaction_count || 0,
//         total_amount: parseFloat((outData.total_amount || 0).toFixed(2)),
//         total_weight: parseFloat((outData.total_weight || 0).toFixed(2)),
//         avg_rate: parseFloat((outData.avg_rate || 0).toFixed(2))
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// export default router;

const router = _express.default.Router();

// Helper to construct WHERE clause for dates
const getDateCondition = (req, dateColumn = 'date') => {
  const {
    start_date,
    end_date
  } = req.query;
  if (start_date && end_date) {
    return {
      sql: ` AND ${dateColumn} >= ? AND ${dateColumn} <= ?`,
      params: [start_date, end_date]
    };
  }
  return {
    sql: '',
    params: []
  };
};

// Initialize table for manual cash hand (Run once)
try {
  _database.default.prepare(`
    CREATE TABLE IF NOT EXISTS cash_hand (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      amount REAL DEFAULT 0
    )
  `).run();

  // Ensure the single row exists
  _database.default.prepare(`INSERT OR IGNORE INTO cash_hand (id, amount) VALUES (1, 0)`).run();
} catch (error) {
  console.error("Error initializing cash_hand table:", error);
}

// ============ PROFIT & LOSS / BALANCE SHEET ROUTES ============

// Update Manual Cash In Hand
router.post('/profit-loss/cash-in-hand', (req, res) => {
  const {
    amount
  } = req.body;
  try {
    _database.default.prepare('UPDATE cash_hand SET amount = ? WHERE id = 1').run(amount || 0);
    res.json({
      success: true,
      message: 'Cash in hand updated',
      amount
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// 1. Balance Sheet Calculation (UPDATED with Date Filters)
router.get('/profit-loss/balance-sheet', (req, res) => {
  try {
    const {
      start_date,
      end_date
    } = req.query;

    // Date clause for stock transactions
    const dateFilter = getDateCondition(req, 'date');

    // --- 1. Cash Flow (Cash In Hand) ---
    // Note: Cash in hand is usually a "current" metric, but we leave it as is.
    const cashRecord = _database.default.prepare('SELECT amount FROM cash_hand WHERE id = 1').get();
    const cashInHand = cashRecord ? cashRecord.amount : 0;

    // --- 2. Stock Value (Filtered by Date) ---
    // We filter stock in/out by date to calculate value for that specific period
    const stockInQuery = `SELECT SUM(weight) as weight, SUM(amount) as amount FROM stock_in WHERE 1=1 ${dateFilter.sql}`;
    const stockOutQuery = `SELECT SUM(weight) as weight FROM stock_out WHERE 1=1 ${dateFilter.sql}`;
    const stockIn = _database.default.prepare(stockInQuery).get(...dateFilter.params);
    const stockOut = _database.default.prepare(stockOutQuery).get(...dateFilter.params);
    const totalInWeight = stockIn.weight || 0;
    const totalInAmount = stockIn.amount || 0; // Total Cost of all purchases in period
    const totalOutWeight = stockOut.weight || 0;

    // Weighted average PURCHASE rate (based on selected period)
    const avgPurchaseRate = totalInWeight > 0 ? totalInAmount / totalInWeight : 0;

    // Remaining weight could be negative if looking at a narrow slice of time where we sold more than we bought
    // We clamp it to 0 for value calculation if strictly P&L, but for balance sheet logic:
    const remainingWeight = Math.max(0, totalInWeight - totalOutWeight);

    // Valuing remaining stock at the Purchase Rate (Cost Price)
    const stockValue = remainingWeight * avgPurchaseRate;

    // --- 3. Customer Balances (Filtered by Date) ---
    // We filter the ledger transactions by date to show balance accrual *during this period*
    const customers = _database.default.prepare('SELECT name FROM customers').all();
    const customerList = customers.map(c => {
      let ledgerQuery = `SELECT SUM(debit) as d, SUM(credit) as c FROM customer_ledger WHERE customer_name = ?`;
      let params = [c.name];
      if (start_date && end_date) {
        ledgerQuery += ` AND date >= ? AND date <= ?`;
        params.push(start_date, end_date);
      }
      const ledger = _database.default.prepare(ledgerQuery).get(...params);
      const debit = ledger.d || 0;
      const credit = ledger.c || 0;
      return {
        name: c.name,
        balance: debit - credit
      };
    }).filter(c => Math.abs(c.balance) > 0);

    // --- 4. Supplier Balances (Filtered by Date) ---
    const suppliers = _database.default.prepare('SELECT name FROM suppliers').all();
    const supplierList = suppliers.map(s => {
      let ledgerQuery = `SELECT SUM(credit) as c, SUM(debit) as d FROM supplier_ledger WHERE supplier_name = ?`;
      let params = [s.name];
      if (start_date && end_date) {
        ledgerQuery += ` AND date >= ? AND date <= ?`;
        params.push(start_date, end_date);
      }
      const ledger = _database.default.prepare(ledgerQuery).get(...params);
      const credit = ledger.c || 0;
      const debit = ledger.d || 0;
      return {
        name: s.name,
        balance: credit - debit
      };
    }).filter(s => Math.abs(s.balance) > 0);
    res.json({
      cash_in_hand: parseFloat(cashInHand.toFixed(2)),
      stock_value: parseFloat(stockValue.toFixed(2)),
      stock_weight: parseFloat(remainingWeight.toFixed(2)),
      avg_purchase_rate_used: parseFloat(avgPurchaseRate.toFixed(2)),
      customers: customerList,
      suppliers: supplierList
    });
  } catch (error) {
    console.error("Balance Sheet Error:", error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Overall P&L Summary (Standard)
router.get('/profit-loss/summary', (req, res) => {
  try {
    const dateFilter = getDateCondition(req);
    const totalIn = _database.default.prepare(`
      SELECT SUM(amount) as total_cost FROM stock_in WHERE 1=1 ${dateFilter.sql}
    `).get(...dateFilter.params);
    const totalOut = _database.default.prepare(`
      SELECT SUM(amount) as total_revenue FROM stock_out WHERE 1=1 ${dateFilter.sql}
    `).get(...dateFilter.params);
    const totalCost = totalIn.total_cost || 0;
    const totalRevenue = totalOut.total_revenue || 0;
    const profitLoss = totalRevenue - totalCost;
    const margin = totalCost > 0 ? (profitLoss / totalCost * 100).toFixed(2) : 0;
    res.json({
      total_cost: parseFloat(totalCost.toFixed(2)),
      total_revenue: parseFloat(totalRevenue.toFixed(2)),
      profit_loss: parseFloat(profitLoss.toFixed(2)),
      profit_margin_percent: parseFloat(margin),
      status: profitLoss >= 0 ? 'profitable' : 'loss'
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// P&L by Category (Filtered)
router.get('/profit-loss/by-category', (req, res) => {
  try {
    const dateFilter = getDateCondition(req);
    const categories = _database.default.prepare(`
      SELECT DISTINCT description FROM stock_in
      UNION
      SELECT DISTINCT description FROM stock_out
      ORDER BY description ASC
    `).all();
    const results = categories.map(cat => {
      const inQuery = `SELECT SUM(amount) as total FROM stock_in WHERE description = ? ${dateFilter.sql}`;
      const outQuery = `SELECT SUM(amount) as total FROM stock_out WHERE description = ? ${dateFilter.sql}`;
      const inData = _database.default.prepare(inQuery).get(cat.description, ...dateFilter.params);
      const outData = _database.default.prepare(outQuery).get(cat.description, ...dateFilter.params);
      const cost = inData.total || 0;
      const revenue = outData.total || 0;
      if (cost === 0 && revenue === 0) return null;
      const profitLoss = revenue - cost;
      const margin = cost > 0 ? (profitLoss / cost * 100).toFixed(2) : 0;
      return {
        category: cat.description,
        cost: parseFloat(cost.toFixed(2)),
        revenue: parseFloat(revenue.toFixed(2)),
        profit_loss: parseFloat(profitLoss.toFixed(2)),
        margin_percent: parseFloat(margin)
      };
    }).filter(item => item !== null);
    res.json(results);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// P&L by Date Range (Explicit Endpoint)
router.get('/profit-loss/by-date-range', (req, res) => {
  const {
    start_date,
    end_date
  } = req.query;
  try {
    if (!start_date || !end_date) {
      return res.status(400).json({
        error: 'start_date and end_date are required (YYYY-MM-DD)'
      });
    }
    const inData = _database.default.prepare(`
      SELECT SUM(amount) as total FROM stock_in 
      WHERE date >= ? AND date <= ?
    `).get(start_date, end_date);
    const outData = _database.default.prepare(`
      SELECT SUM(amount) as total FROM stock_out 
      WHERE date >= ? AND date <= ?
    `).get(start_date, end_date);
    const cost = inData.total || 0;
    const revenue = outData.total || 0;
    const profitLoss = revenue - cost;
    const margin = cost > 0 ? (profitLoss / cost * 100).toFixed(2) : 0;
    res.json({
      period: `${start_date} to ${end_date}`,
      cost: parseFloat(cost.toFixed(2)),
      revenue: parseFloat(revenue.toFixed(2)),
      profit_loss: parseFloat(profitLoss.toFixed(2)),
      margin_percent: parseFloat(margin)
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// P&L by Supplier (Filtered)
router.get('/profit-loss/by-supplier', (req, res) => {
  try {
    const dateFilter = getDateCondition(req);
    const suppliers = _database.default.prepare(`
      SELECT DISTINCT supplier FROM stock_in ORDER BY supplier ASC
    `).all();
    const results = suppliers.map(sup => {
      const query = `
        SELECT SUM(amount) as total, SUM(weight) as qty FROM stock_in 
        WHERE supplier = ? ${dateFilter.sql}
      `;
      const costData = _database.default.prepare(query).get(sup.supplier, ...dateFilter.params);
      const cost = costData.total || 0;
      const qty = costData.qty || 0;
      if (cost === 0 && qty === 0) return null;
      const avgRate = qty > 0 ? (cost / qty).toFixed(2) : 0;
      return {
        supplier: sup.supplier,
        total_cost: parseFloat(cost.toFixed(2)),
        total_quantity: parseFloat(qty.toFixed(2)),
        avg_rate_per_unit: parseFloat(avgRate)
      };
    }).filter(item => item !== null);
    res.json(results);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// P&L by Customer (Filtered)
router.get('/profit-loss/by-customer', (req, res) => {
  try {
    const dateFilter = getDateCondition(req);
    const customers = _database.default.prepare(`
      SELECT DISTINCT customer FROM stock_out ORDER BY customer ASC
    `).all();
    const results = customers.map(cust => {
      const query = `
        SELECT SUM(amount) as total, SUM(weight) as qty FROM stock_out 
        WHERE customer = ? ${dateFilter.sql}
      `;
      const revenueData = _database.default.prepare(query).get(cust.customer, ...dateFilter.params);
      const revenue = revenueData.total || 0;
      const qty = revenueData.qty || 0;
      if (revenue === 0 && qty === 0) return null;
      const avgRate = qty > 0 ? (revenue / qty).toFixed(2) : 0;
      return {
        customer: cust.customer,
        total_revenue: parseFloat(revenue.toFixed(2)),
        total_quantity: parseFloat(qty.toFixed(2)),
        avg_rate_per_unit: parseFloat(avgRate)
      };
    }).filter(item => item !== null);
    res.json(results);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Detailed P&L Report (Restored & Filtered)
router.get('/profit-loss/detailed-report', (req, res) => {
  try {
    const dateFilter = getDateCondition(req);
    const inData = _database.default.prepare(`
      SELECT 
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        SUM(weight) as total_weight,
        AVG(rate) as avg_rate
      FROM stock_in
      WHERE 1=1 ${dateFilter.sql}
    `).get(...dateFilter.params);
    const outData = _database.default.prepare(`
      SELECT 
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        SUM(weight) as total_weight,
        AVG(rate) as avg_rate
      FROM stock_out
      WHERE 1=1 ${dateFilter.sql}
    `).get(...dateFilter.params);
    const totalCost = inData.total_amount || 0;
    const totalRevenue = outData.total_amount || 0;
    const profitLoss = totalRevenue - totalCost;
    const margin = totalCost > 0 ? (profitLoss / totalCost * 100).toFixed(2) : 0;
    res.json({
      summary: {
        total_cost: parseFloat(totalCost.toFixed(2)),
        total_revenue: parseFloat(totalRevenue.toFixed(2)),
        profit_loss: parseFloat(profitLoss.toFixed(2)),
        profit_margin_percent: parseFloat(margin),
        status: profitLoss >= 0 ? 'profitable' : 'loss'
      },
      purchases: {
        transaction_count: inData.transaction_count || 0,
        total_amount: parseFloat((inData.total_amount || 0).toFixed(2)),
        total_weight: parseFloat((inData.total_weight || 0).toFixed(2)),
        avg_rate: parseFloat((inData.avg_rate || 0).toFixed(2))
      },
      sales: {
        transaction_count: outData.transaction_count || 0,
        total_amount: parseFloat((outData.total_amount || 0).toFixed(2)),
        total_weight: parseFloat((outData.total_weight || 0).toFixed(2)),
        avg_rate: parseFloat((outData.avg_rate || 0).toFixed(2))
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});
var _default = exports.default = router;