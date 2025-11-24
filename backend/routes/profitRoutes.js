import express from 'express';
import db from '../database/database.js';

const router = express.Router();

// ============ PROFIT & LOSS ROUTES ============

// Overall P&L Summary
router.get('/profit-loss/summary', (req, res) => {
  try {
    const totalIn = db.prepare(`
      SELECT SUM(amount) as total_cost FROM stock_in
    `).get();

    const totalOut = db.prepare(`
      SELECT SUM(amount) as total_revenue FROM stock_out
    `).get();

    const totalCost = totalIn.total_cost || 0;
    const totalRevenue = totalOut.total_revenue || 0;
    const profitLoss = totalRevenue - totalCost;
    const margin = totalCost > 0 ? ((profitLoss / totalCost) * 100).toFixed(2) : 0;

    res.json({
      total_cost: parseFloat(totalCost.toFixed(2)),
      total_revenue: parseFloat(totalRevenue.toFixed(2)),
      profit_loss: parseFloat(profitLoss.toFixed(2)),
      profit_margin_percent: parseFloat(margin),
      status: profitLoss >= 0 ? 'profitable' : 'loss'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// P&L by Category
router.get('/profit-loss/by-category', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT DISTINCT description FROM stock_in
      UNION
      SELECT DISTINCT description FROM stock_out
      ORDER BY description ASC
    `).all();

    const results = categories.map(cat => {
      const inData = db.prepare(`
        SELECT SUM(amount) as total FROM stock_in WHERE description = ?
      `).get(cat.description);

      const outData = db.prepare(`
        SELECT SUM(amount) as total FROM stock_out WHERE description = ?
      `).get(cat.description);

      const cost = inData.total || 0;
      const revenue = outData.total || 0;
      const profitLoss = revenue - cost;
      const margin = cost > 0 ? ((profitLoss / cost) * 100).toFixed(2) : 0;

      return {
        category: cat.description,
        cost: parseFloat(cost.toFixed(2)),
        revenue: parseFloat(revenue.toFixed(2)),
        profit_loss: parseFloat(profitLoss.toFixed(2)),
        margin_percent: parseFloat(margin)
      };
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// P&L by Date Range
router.get('/profit-loss/by-date-range', (req, res) => {
  const { start_date, end_date } = req.query;

  try {
    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required (YYYY-MM-DD)' });
    }

    const inData = db.prepare(`
      SELECT SUM(amount) as total FROM stock_in 
      WHERE date >= ? AND date <= ?
    `).get(start_date, end_date);

    const outData = db.prepare(`
      SELECT SUM(amount) as total FROM stock_out 
      WHERE date >= ? AND date <= ?
    `).get(start_date, end_date);

    const cost = inData.total || 0;
    const revenue = outData.total || 0;
    const profitLoss = revenue - cost;
    const margin = cost > 0 ? ((profitLoss / cost) * 100).toFixed(2) : 0;

    res.json({
      period: `${start_date} to ${end_date}`,
      cost: parseFloat(cost.toFixed(2)),
      revenue: parseFloat(revenue.toFixed(2)),
      profit_loss: parseFloat(profitLoss.toFixed(2)),
      margin_percent: parseFloat(margin)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// P&L by Supplier (Cost Analysis)
router.get('/profit-loss/by-supplier', (req, res) => {
  try {
    const suppliers = db.prepare(`
      SELECT DISTINCT supplier FROM stock_in ORDER BY supplier ASC
    `).all();

    const results = suppliers.map(sup => {
      const costData = db.prepare(`
        SELECT SUM(amount) as total, SUM(weight) as qty FROM stock_in 
        WHERE supplier = ?
      `).get(sup.supplier);

      const cost = costData.total || 0;
      const qty = costData.qty || 0;
      const avgRate = qty > 0 ? (cost / qty).toFixed(2) : 0;

      return {
        supplier: sup.supplier,
        total_cost: parseFloat(cost.toFixed(2)),
        total_quantity: parseFloat(qty.toFixed(2)),
        avg_rate_per_unit: parseFloat(avgRate)
      };
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// P&L by Customer (Revenue Analysis)
router.get('/profit-loss/by-customer', (req, res) => {
  try {
    const customers = db.prepare(`
      SELECT DISTINCT customer FROM stock_out ORDER BY customer ASC
    `).all();

    const results = customers.map(cust => {
      const revenueData = db.prepare(`
        SELECT SUM(amount) as total, SUM(weight) as qty FROM stock_out 
        WHERE customer = ?
      `).get(cust.customer);

      const revenue = revenueData.total || 0;
      const qty = revenueData.qty || 0;
      const avgRate = qty > 0 ? (revenue / qty).toFixed(2) : 0;

      return {
        customer: cust.customer,
        total_revenue: parseFloat(revenue.toFixed(2)),
        total_quantity: parseFloat(qty.toFixed(2)),
        avg_rate_per_unit: parseFloat(avgRate)
      };
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Detailed P&L Report (Most Comprehensive)
router.get('/profit-loss/detailed-report', (req, res) => {
  try {
    const inData = db.prepare(`
      SELECT 
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        SUM(weight) as total_weight,
        AVG(rate) as avg_rate
      FROM stock_in
    `).get();

    const outData = db.prepare(`
      SELECT 
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        SUM(weight) as total_weight,
        AVG(rate) as avg_rate
      FROM stock_out
    `).get();

    const totalCost = inData.total_amount || 0;
    const totalRevenue = outData.total_amount || 0;
    const profitLoss = totalRevenue - totalCost;
    const margin = totalCost > 0 ? ((profitLoss / totalCost) * 100).toFixed(2) : 0;

    const inventory = db.prepare(`
      SELECT 
        SUM(CASE WHEN description IN (SELECT description FROM stock_in) THEN weight ELSE 0 END) as total_in,
        SUM(CASE WHEN description IN (SELECT description FROM stock_out) THEN weight ELSE 0 END) as total_out
      FROM (
        SELECT description, SUM(weight) as weight FROM stock_in GROUP BY description
        UNION ALL
        SELECT description, SUM(weight) as weight FROM stock_out GROUP BY description
      )
    `).get();

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
    res.status(500).json({ error: error.message });
  }
});

export default router;