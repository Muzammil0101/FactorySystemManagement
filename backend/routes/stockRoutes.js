// import express from "express";
// import db from "../database/database.js";

// const router = express.Router();

// /* ======================================================
//                 DEBUG ROUTES
// ====================================================== */

// router.get("/debug/stock-data", (req, res) => {
//   try {
//     const stockInItems = db.prepare("SELECT id, description, weight FROM stock_in").all();
//     const stockOutItems = db.prepare("SELECT id, description, weight FROM stock_out").all();
//     const categories = db.prepare("SELECT id, name FROM categories").all();

//     res.json({
//       categories,
//       stockInItems,
//       stockOutItems,
//       message: "Check if category names match stock descriptions exactly",
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// /* ======================================================
//                 CATEGORY ROUTES
// ====================================================== */

// router.get("/categories", (req, res) => {
//   try {
//     const categories = db.prepare("SELECT * FROM categories ORDER BY name ASC").all();

//     const categoriesWithStock = categories.map((cat) => {
//       // Use exact match instead of LIKE for better accuracy
//       const stockInData = db
//         .prepare(`
//           SELECT COALESCE(SUM(CAST(weight AS REAL)), 0) AS total
//           FROM stock_in 
//           WHERE LOWER(TRIM(description)) = LOWER(TRIM(?))
//       `)
//         .get(cat.name);

//       const stockOutData = db
//         .prepare(`
//           SELECT COALESCE(SUM(CAST(weight AS REAL)), 0) AS total
//           FROM stock_out 
//           WHERE LOWER(TRIM(description)) = LOWER(TRIM(?))
//       `)
//         .get(cat.name);

//       const stockIn = parseFloat(stockInData.total) || 0;
//       const stockOut = parseFloat(stockOutData.total) || 0;

//       return {
//         ...cat,
//         stockIn,
//         stockOut,
//         currentStock: stockIn - stockOut,
//       };
//     });

//     res.json(categoriesWithStock);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Add category
// router.post("/categories", (req, res) => {
//   const { name, description } = req.body;

//   try {
//     if (!name || !name.trim()) {
//       return res.status(400).json({ error: "Category name is required" });
//     }

//     const existing = db.prepare("SELECT * FROM categories WHERE name = ?").get(name);
//     if (existing) {
//       return res.status(400).json({ error: "Category already exists" });
//     }

//     const result = db
//       .prepare(`
//         INSERT INTO categories (name, description)
//         VALUES (?, ?)
//     `)
//       .run(name, description || "");

//     const newCategory = db.prepare("SELECT * FROM categories WHERE id = ?").get(result.lastInsertRowid);

//     res.json({
//       success: true,
//       message: `Category "${name}" added successfully`,
//       data: {
//         ...newCategory,
//         stockIn: 0,
//         stockOut: 0,
//         currentStock: 0,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Update category
// router.put("/categories/:id", (req, res) => {
//   const { id } = req.params;
//   const { name, description } = req.body;

//   try {
//     if (!name || !name.trim()) {
//       return res.status(400).json({ error: "Category name is required" });
//     }

//     const existing = db.prepare("SELECT * FROM categories WHERE id = ?").get(id);
//     if (!existing) {
//       return res.status(404).json({ error: "Category not found" });
//     }

//     const duplicate = db.prepare("SELECT * FROM categories WHERE name = ? AND id != ?").get(name, id);
//     if (duplicate) {
//       return res.status(400).json({ error: "Another category with this name already exists" });
//     }

//     db.prepare(
//       `
//       UPDATE categories
//       SET name = ?, description = ?
//       WHERE id = ?
//     `
//     ).run(name, description || "", id);

//     const updated = db.prepare("SELECT * FROM categories WHERE id = ?").get(id);

//     const stockInData = db
//       .prepare(`
//         SELECT SUM(weight) as total 
//         FROM stock_in 
//         WHERE description = ?
//     `)
//       .get(updated.name);

//     const stockOutData = db
//       .prepare(`
//         SELECT SUM(weight) as total 
//         FROM stock_out 
//         WHERE description = ?
//     `)
//       .get(updated.name);

//     res.json({
//       success: true,
//       message: "Category updated successfully",
//       data: {
//         ...updated,
//         stockIn: stockInData.total || 0,
//         stockOut: stockOutData.total || 0,
//         currentStock: (stockInData.total || 0) - (stockOutData.total || 0),
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Delete category
// router.delete("/categories/:id", (req, res) => {
//   const { id } = req.params;

//   try {
//     const category = db.prepare("SELECT * FROM categories WHERE id = ?").get(id);
//     if (!category) {
//       return res.status(404).json({ error: "Category not found" });
//     }

//     const inStockIn = db.prepare("SELECT COUNT(*) as count FROM stock_in WHERE description = ?").get(category.name);
//     const inStockOut = db.prepare("SELECT COUNT(*) as count FROM stock_out WHERE description = ?").get(category.name);

//     if (inStockIn.count > 0 || inStockOut.count > 0) {
//       return res.status(400).json({
//         error: `Cannot delete "${category.name}" because it is in use`,
//       });
//     }

//     db.prepare("DELETE FROM categories WHERE id = ?").run(id);

//     res.json({
//       success: true,
//       message: `Category "${category.name}" deleted successfully`,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// /* ======================================================
//                 STOCK IN ROUTES
// ====================================================== */

// router.get("/stock-in", (req, res) => {
//   try {
//     const stockIn = db.prepare("SELECT * FROM stock_in ORDER BY date DESC").all();
//     res.json(stockIn);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Add Stock In
// router.post("/stock-in", (req, res) => {
//   const { date, description, weight, rate, amount, supplier } = req.body;

//   try {
//     if (!date || !description || !weight || !rate || !supplier) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     const result = db
//       .prepare(
//         `
//       INSERT INTO stock_in (date, description, weight, rate, amount, supplier)
//       VALUES (?, ?, ?, ?, ?, ?)
//     `
//       )
//       .run(date, description, weight, rate, amount, supplier);

//     // Auto-create category if not found
//     db.prepare(
//       `
//       INSERT OR IGNORE INTO categories (name, description)
//       VALUES (?, '')
//     `
//     ).run(description);

//     // Auto-create supplier
//     const existingSupplier = db.prepare("SELECT * FROM suppliers WHERE name = ?").get(supplier);
//     if (!existingSupplier) {
//       db.prepare(
//         `
//         INSERT INTO suppliers (name, phone, city)
//         VALUES (?, '', '')
//       `
//       ).run(supplier);
//     }

//     // Ledger entry
//     db.prepare(
//       `
//       INSERT INTO supplier_ledger (supplier_name, date, description, weight, rate, debit, credit)
//       VALUES (?, ?, ?, ?, ?, 0, ?)
//     `
//     ).run(supplier, date, description, weight, rate, amount);

//     const newRecord = db.prepare("SELECT * FROM stock_in WHERE id = ?").get(result.lastInsertRowid);

//     res.json({
//       success: true,
//       message: `Added ${weight} kg of ${description}`,
//       data: newRecord,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Delete Stock In
// router.delete("/stock-in/:id", (req, res) => {
//   try {
//     const { id } = req.params;

//     const record = db.prepare("SELECT * FROM stock_in WHERE id = ?").get(id);
//     if (!record) {
//       return res.status(404).json({ error: "Record not found" });
//     }

//     db.prepare("DELETE FROM stock_in WHERE id = ?").run(id);

//     db.prepare(
//       `
//       DELETE FROM supplier_ledger
//       WHERE supplier_name = ? AND date = ? AND description = ? AND credit = ?
//       ORDER BY id DESC LIMIT 1
//     `
//     ).run(record.supplier, record.date, record.description, record.amount);

//     res.json({ success: true, message: "Stock in record deleted" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// /* ======================================================
//                 STOCK OUT ROUTES
// ====================================================== */

// router.get("/stock-out", (req, res) => {
//   try {
//     const stockOut = db.prepare("SELECT * FROM stock_out ORDER BY date DESC").all();
//     res.json(stockOut);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Add Stock Out
// router.post("/stock-out", (req, res) => {
//   const { date, description, weight, rate, amount, customer } = req.body;

//   try {
//     if (!date || !description || !weight || !rate || !customer) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     const totalIn = db.prepare("SELECT SUM(weight) as total FROM stock_in").get();
//     const totalOut = db.prepare("SELECT SUM(weight) as total FROM stock_out").get();

//     const currentStock = (totalIn.total || 0) - (totalOut.total || 0);

//     if (parseFloat(weight) > currentStock) {
//       return res.status(400).json({
//         error: `Not enough stock! Available: ${currentStock.toFixed(2)} kg`,
//       });
//     }

//     const result = db
//       .prepare(
//         `
//       INSERT INTO stock_out (date, description, weight, rate, amount, customer)
//       VALUES (?, ?, ?, ?, ?, ?)
//     `
//       )
//       .run(date, description, weight, rate, amount, customer);

//     // Auto-create category
//     db.prepare(
//       `
//       INSERT OR IGNORE INTO categories (name, description)
//       VALUES (?, '')
//     `
//     ).run(description);

//     // Auto-create customer
//     const existingCustomer = db.prepare("SELECT * FROM customers WHERE name = ?").get(customer);
//     if (!existingCustomer) {
//       db.prepare(
//         `
//         INSERT INTO customers (name, phone, city)
//         VALUES (?, '', '')
//       `
//       ).run(customer);
//     }

//     // Ledger entry
//     db.prepare(
//       `
//       INSERT INTO customer_ledger (customer_name, date, description, weight, rate, debit, credit)
//       VALUES (?, ?, ?, ?, ?, ?, 0)
//     `
//     ).run(customer, date, description, weight, rate, amount);

//     const newRecord = db.prepare("SELECT * FROM stock_out WHERE id = ?").get(result.lastInsertRowid);

//     res.json({
//       success: true,
//       message: `Sold ${weight} kg of ${description}`,
//       data: newRecord,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Delete Stock Out
// router.delete("/stock-out/:id", (req, res) => {
//   try {
//     const { id } = req.params;

//     const record = db.prepare("SELECT * FROM stock_out WHERE id = ?").get(id);
//     if (!record) {
//       return res.status(404).json({ error: "Record not found" });
//     }

//     db.prepare("DELETE FROM stock_out WHERE id = ?").run(id);

//     db.prepare(
//       `
//       DELETE FROM customer_ledger
//       WHERE customer_name = ? AND date = ? AND description = ? AND debit = ?
//       ORDER BY id DESC LIMIT 1
//     `
//     ).run(record.customer, record.date, record.description, record.amount);

//     res.json({ success: true, message: "Stock out record deleted" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// /* ======================================================
//                 SUMMARY ROUTES
// ====================================================== */

// router.get("/summary", (req, res) => {
//   try {
//     const totalIn = db.prepare("SELECT SUM(weight) as total FROM stock_in").get();
//     const totalOut = db.prepare("SELECT SUM(weight) as total FROM stock_out").get();

//     res.json({
//       totalIn: totalIn.total || 0,
//       totalOut: totalOut.total || 0,
//       currentStock: (totalIn.total || 0) - (totalOut.total || 0),
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// /* ======================================================
//           STOCK BY CATEGORY
// ====================================================== */

// router.get("/by-category", (req, res) => {
//   try {
//     const stockInByCategory = db
//       .prepare(`
//         SELECT description, SUM(weight) AS total_in
//         FROM stock_in
//         GROUP BY description
//     `)
//       .all();

//     const stockOutByCategory = db
//       .prepare(`
//         SELECT description, SUM(weight) AS total_out
//         FROM stock_out
//         GROUP BY description
//     `)
//       .all();

//     const categoryMap = {};

//     stockInByCategory.forEach((item) => {
//       categoryMap[item.description] = {
//         description: item.description,
//         stockIn: item.total_in,
//         stockOut: 0,
//         currentStock: item.total_in,
//       };
//     });

//     stockOutByCategory.forEach((item) => {
//       if (categoryMap[item.description]) {
//         categoryMap[item.description].stockOut = item.total_out;
//         categoryMap[item.description].currentStock -= item.total_out;
//       } else {
//         categoryMap[item.description] = {
//           description: item.description,
//           stockIn: 0,
//           stockOut: item.total_out,
//           currentStock: -item.total_out,
//         };
//       }
//     });

//     res.json(Object.values(categoryMap));
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// /* ======================================================
//                 LEDGER ROUTES
// ====================================================== */

// // Supplier Ledger
// router.get("/supplier-ledger/:supplierName", (req, res) => {
//   try {
//     const ledger = db
//       .prepare(
//         `
//       SELECT * FROM supplier_ledger
//       WHERE supplier_name = ?
//       ORDER BY date DESC, id DESC
//     `
//       )
//       .all(req.params.supplierName);

//     res.json(ledger);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Customer Ledger
// router.get("/customer-ledger/:customerName", (req, res) => {
//   try {
//     const ledger = db
//       .prepare(
//         `
//       SELECT * FROM customer_ledger
//       WHERE customer_name = ?
//       ORDER BY date DESC, id DESC
//     `
//       )
//       .all(req.params.customerName);

//     res.json(ledger);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // All suppliers with ledger
// router.get("/suppliers-with-ledger", (req, res) => {
//   try {
//     const suppliers = db.prepare("SELECT * FROM suppliers").all();

//     const result = suppliers.map((s) => {
//       const ledger = db
//         .prepare(
//           `
//         SELECT * FROM supplier_ledger
//         WHERE supplier_name = ?
//         ORDER BY date DESC, id DESC
//       `
//         )
//         .all(s.name);

//       return { ...s, ledger };
//     });

//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // All customers with ledger
// router.get("/customers-with-ledger", (req, res) => {
//   try {
//     const customers = db.prepare("SELECT * FROM customers").all();

//     const result = customers.map((c) => {
//       const ledger = db
//         .prepare(
//           `
//         SELECT * FROM customer_ledger
//         WHERE customer_name = ?
//         ORDER BY date DESC, id DESC
//       `
//         )
//         .all(c.name);

//       return { ...c, ledger };
//     });

//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// export default router;

import express from "express";
import db from "../database/database.js";

const router = express.Router();

/* ======================================================
                DEBUG ROUTES
====================================================== */

router.get("/debug/stock-data", (req, res) => {
  try {
    const stockInItems = db.prepare("SELECT id, description, weight FROM stock_in").all();
    const stockOutItems = db.prepare("SELECT id, description, weight FROM stock_out").all();
    const categories = db.prepare("SELECT id, name FROM categories").all();

    res.json({
      categories,
      stockInItems,
      stockOutItems,
      message: "Check if category names match stock descriptions exactly",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ======================================================
                CATEGORY ROUTES
====================================================== */

router.get("/categories", (req, res) => {
  try {
    const categories = db.prepare("SELECT * FROM categories ORDER BY name ASC").all();

    const categoriesWithStock = categories.map((cat) => {
      // Use exact match instead of LIKE for better accuracy
      const stockInData = db
        .prepare(`
          SELECT COALESCE(SUM(CAST(weight AS REAL)), 0) AS total
          FROM stock_in 
          WHERE LOWER(TRIM(description)) = LOWER(TRIM(?))
      `)
        .get(cat.name);

      const stockOutData = db
        .prepare(`
          SELECT COALESCE(SUM(CAST(weight AS REAL)), 0) AS total
          FROM stock_out 
          WHERE LOWER(TRIM(description)) = LOWER(TRIM(?))
      `)
        .get(cat.name);

      const stockIn = parseFloat(stockInData.total) || 0;
      const stockOut = parseFloat(stockOutData.total) || 0;

      return {
        ...cat,
        stockIn,
        stockOut,
        currentStock: stockIn - stockOut,
      };
    });

    res.json(categoriesWithStock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add category
router.post("/categories", (req, res) => {
  const { name, description } = req.body;

  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const existing = db.prepare("SELECT * FROM categories WHERE name = ?").get(name);
    if (existing) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const result = db
      .prepare(`
        INSERT INTO categories (name, description)
        VALUES (?, ?)
    `)
      .run(name, description || "");

    const newCategory = db.prepare("SELECT * FROM categories WHERE id = ?").get(result.lastInsertRowid);

    res.json({
      success: true,
      message: `Category "${name}" added successfully`,
      data: {
        ...newCategory,
        stockIn: 0,
        stockOut: 0,
        currentStock: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update category
router.put("/categories/:id", (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const existing = db.prepare("SELECT * FROM categories WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ error: "Category not found" });
    }

    const duplicate = db.prepare("SELECT * FROM categories WHERE name = ? AND id != ?").get(name, id);
    if (duplicate) {
      return res.status(400).json({ error: "Another category with this name already exists" });
    }

    db.prepare(
      `
      UPDATE categories
      SET name = ?, description = ?
      WHERE id = ?
    `
    ).run(name, description || "", id);

    const updated = db.prepare("SELECT * FROM categories WHERE id = ?").get(id);

    const stockInData = db
      .prepare(`
        SELECT SUM(weight) as total 
        FROM stock_in 
        WHERE description = ?
    `)
      .get(updated.name);

    const stockOutData = db
      .prepare(`
        SELECT SUM(weight) as total 
        FROM stock_out 
        WHERE description = ?
    `)
      .get(updated.name);

    res.json({
      success: true,
      message: "Category updated successfully",
      data: {
        ...updated,
        stockIn: stockInData.total || 0,
        stockOut: stockOutData.total || 0,
        currentStock: (stockInData.total || 0) - (stockOutData.total || 0),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete category
router.delete("/categories/:id", (req, res) => {
  const { id } = req.params;

  try {
    const category = db.prepare("SELECT * FROM categories WHERE id = ?").get(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const inStockIn = db.prepare("SELECT COUNT(*) as count FROM stock_in WHERE description = ?").get(category.name);
    const inStockOut = db.prepare("SELECT COUNT(*) as count FROM stock_out WHERE description = ?").get(category.name);

    if (inStockIn.count > 0 || inStockOut.count > 0) {
      return res.status(400).json({
        error: `Cannot delete "${category.name}" because it is in use`,
      });
    }

    db.prepare("DELETE FROM categories WHERE id = ?").run(id);

    res.json({
      success: true,
      message: `Category "${category.name}" deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ======================================================
                STOCK IN ROUTES
====================================================== */

router.get("/stock-in", (req, res) => {
  try {
    const stockIn = db.prepare("SELECT * FROM stock_in ORDER BY date DESC").all();
    res.json(stockIn);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Stock In
router.post("/stock-in", (req, res) => {
  const { date, description, weight, rate, amount, supplier } = req.body;

  try {
    if (!date || !description || !weight || !rate || !supplier) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = db
      .prepare(
        `
      INSERT INTO stock_in (date, description, weight, rate, amount, supplier)
      VALUES (?, ?, ?, ?, ?, ?)
    `
      )
      .run(date, description, weight, rate, amount, supplier);

    // Auto-create category if not found
    db.prepare(
      `
      INSERT OR IGNORE INTO categories (name, description)
      VALUES (?, '')
    `
    ).run(description);

    // Auto-create supplier
    const existingSupplier = db.prepare("SELECT * FROM suppliers WHERE name = ?").get(supplier);
    if (!existingSupplier) {
      db.prepare(
        `
        INSERT INTO suppliers (name, phone, city)
        VALUES (?, '', '')
      `
      ).run(supplier);
    }

    // Ledger entry
    db.prepare(
      `
      INSERT INTO supplier_ledger (supplier_name, date, description, weight, rate, debit, credit)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `
    ).run(supplier, date, description, weight, rate, amount);

    const newRecord = db.prepare("SELECT * FROM stock_in WHERE id = ?").get(result.lastInsertRowid);

    res.json({
      success: true,
      message: `Added ${weight} kg of ${description}`,
      data: newRecord,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Stock In
router.put("/stock-in/:id", (req, res) => {
  const { id } = req.params;
  const { date, description, weight, rate, amount, supplier } = req.body;

  try {
    // Get existing record
    const existing = db.prepare("SELECT * FROM stock_in WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ error: "Stock in record not found" });
    }

    // Validate required fields
    if (!date || !description || !weight || !rate || !supplier) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Update stock_in record
    db.prepare(
      `
      UPDATE stock_in
      SET date = ?, description = ?, weight = ?, rate = ?, amount = ?, supplier = ?
      WHERE id = ?
    `
    ).run(date, description, weight, rate, amount, supplier, id);

    // Auto-create category if new description
    db.prepare(
      `
      INSERT OR IGNORE INTO categories (name, description)
      VALUES (?, '')
    `
    ).run(description);

    // Auto-create supplier if new
    const existingSupplier = db.prepare("SELECT * FROM suppliers WHERE name = ?").get(supplier);
    if (!existingSupplier) {
      db.prepare(
        `
        INSERT INTO suppliers (name, phone, city)
        VALUES (?, '', '')
      `
      ).run(supplier);
    }

    // Delete old ledger entry
    db.prepare(
      `
      DELETE FROM supplier_ledger
      WHERE supplier_name = ? AND date = ? AND description = ? AND credit = ?
      ORDER BY id DESC LIMIT 1
    `
    ).run(existing.supplier, existing.date, existing.description, existing.amount);

    // Create new ledger entry
    db.prepare(
      `
      INSERT INTO supplier_ledger (supplier_name, date, description, weight, rate, debit, credit)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `
    ).run(supplier, date, description, weight, rate, amount);

    const updated = db.prepare("SELECT * FROM stock_in WHERE id = ?").get(id);

    res.json({
      success: true,
      message: "Stock in record updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Stock In
router.delete("/stock-in/:id", (req, res) => {
  try {
    const { id } = req.params;

    const record = db.prepare("SELECT * FROM stock_in WHERE id = ?").get(id);
    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    db.prepare("DELETE FROM stock_in WHERE id = ?").run(id);

    db.prepare(
      `
      DELETE FROM supplier_ledger
      WHERE supplier_name = ? AND date = ? AND description = ? AND credit = ?
      ORDER BY id DESC LIMIT 1
    `
    ).run(record.supplier, record.date, record.description, record.amount);

    res.json({ success: true, message: "Stock in record deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ======================================================
                STOCK OUT ROUTES
====================================================== */

router.get("/stock-out", (req, res) => {
  try {
    const stockOut = db.prepare("SELECT * FROM stock_out ORDER BY date DESC").all();
    res.json(stockOut);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Stock Out
router.post("/stock-out", (req, res) => {
  const { date, description, weight, rate, amount, customer } = req.body;

  try {
    if (!date || !description || !weight || !rate || !customer) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const totalIn = db.prepare("SELECT SUM(weight) as total FROM stock_in").get();
    const totalOut = db.prepare("SELECT SUM(weight) as total FROM stock_out").get();

    const currentStock = (totalIn.total || 0) - (totalOut.total || 0);

    if (parseFloat(weight) > currentStock) {
      return res.status(400).json({
        error: `Not enough stock! Available: ${currentStock.toFixed(2)} kg`,
      });
    }

    const result = db
      .prepare(
        `
      INSERT INTO stock_out (date, description, weight, rate, amount, customer)
      VALUES (?, ?, ?, ?, ?, ?)
    `
      )
      .run(date, description, weight, rate, amount, customer);

    // Auto-create category
    db.prepare(
      `
      INSERT OR IGNORE INTO categories (name, description)
      VALUES (?, '')
    `
    ).run(description);

    // Auto-create customer
    const existingCustomer = db.prepare("SELECT * FROM customers WHERE name = ?").get(customer);
    if (!existingCustomer) {
      db.prepare(
        `
        INSERT INTO customers (name, phone, city)
        VALUES (?, '', '')
      `
      ).run(customer);
    }

    // Ledger entry
    db.prepare(
      `
      INSERT INTO customer_ledger (customer_name, date, description, weight, rate, debit, credit)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `
    ).run(customer, date, description, weight, rate, amount);

    const newRecord = db.prepare("SELECT * FROM stock_out WHERE id = ?").get(result.lastInsertRowid);

    res.json({
      success: true,
      message: `Sold ${weight} kg of ${description}`,
      data: newRecord,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Stock Out
router.put("/stock-out/:id", (req, res) => {
  const { id } = req.params;
  const { date, description, weight, rate, amount, customer } = req.body;

  try {
    // Get existing record
    const existing = db.prepare("SELECT * FROM stock_out WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ error: "Stock out record not found" });
    }

    // Validate required fields
    if (!date || !description || !weight || !rate || !customer) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check stock availability (add back the old weight, then check if new weight is available)
    const totalIn = db.prepare("SELECT SUM(weight) as total FROM stock_in").get();
    const totalOut = db.prepare("SELECT SUM(weight) as total FROM stock_out WHERE id != ?").get(id);

    const currentStock = (totalIn.total || 0) - (totalOut.total || 0);

    if (parseFloat(weight) > currentStock) {
      return res.status(400).json({
        error: `Not enough stock! Available: ${currentStock.toFixed(2)} kg`,
      });
    }

    // Update stock_out record
    db.prepare(
      `
      UPDATE stock_out
      SET date = ?, description = ?, weight = ?, rate = ?, amount = ?, customer = ?
      WHERE id = ?
    `
    ).run(date, description, weight, rate, amount, customer, id);

    // Auto-create category if new description
    db.prepare(
      `
      INSERT OR IGNORE INTO categories (name, description)
      VALUES (?, '')
    `
    ).run(description);

    // Auto-create customer if new
    const existingCustomer = db.prepare("SELECT * FROM customers WHERE name = ?").get(customer);
    if (!existingCustomer) {
      db.prepare(
        `
        INSERT INTO customers (name, phone, city)
        VALUES (?, '', '')
      `
      ).run(customer);
    }

    // Delete old ledger entry
    db.prepare(
      `
      DELETE FROM customer_ledger
      WHERE customer_name = ? AND date = ? AND description = ? AND debit = ?
      ORDER BY id DESC LIMIT 1
    `
    ).run(existing.customer, existing.date, existing.description, existing.amount);

    // Create new ledger entry
    db.prepare(
      `
      INSERT INTO customer_ledger (customer_name, date, description, weight, rate, debit, credit)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `
    ).run(customer, date, description, weight, rate, amount);

    const updated = db.prepare("SELECT * FROM stock_out WHERE id = ?").get(id);

    res.json({
      success: true,
      message: "Stock out record updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Stock Out
router.delete("/stock-out/:id", (req, res) => {
  try {
    const { id } = req.params;

    const record = db.prepare("SELECT * FROM stock_out WHERE id = ?").get(id);
    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    db.prepare("DELETE FROM stock_out WHERE id = ?").run(id);

    db.prepare(
      `
      DELETE FROM customer_ledger
      WHERE customer_name = ? AND date = ? AND description = ? AND debit = ?
      ORDER BY id DESC LIMIT 1
    `
    ).run(record.customer, record.date, record.description, record.amount);

    res.json({ success: true, message: "Stock out record deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ======================================================
                SUMMARY ROUTES
====================================================== */

router.get("/summary", (req, res) => {
  try {
    const totalIn = db.prepare("SELECT SUM(weight) as total FROM stock_in").get();
    const totalOut = db.prepare("SELECT SUM(weight) as total FROM stock_out").get();

    res.json({
      totalIn: totalIn.total || 0,
      totalOut: totalOut.total || 0,
      currentStock: (totalIn.total || 0) - (totalOut.total || 0),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ======================================================
          STOCK BY CATEGORY
====================================================== */

router.get("/by-category", (req, res) => {
  try {
    const stockInByCategory = db
      .prepare(`
        SELECT description, SUM(weight) AS total_in
        FROM stock_in
        GROUP BY description
    `)
      .all();

    const stockOutByCategory = db
      .prepare(`
        SELECT description, SUM(weight) AS total_out
        FROM stock_out
        GROUP BY description
    `)
      .all();

    const categoryMap = {};

    stockInByCategory.forEach((item) => {
      categoryMap[item.description] = {
        description: item.description,
        stockIn: item.total_in,
        stockOut: 0,
        currentStock: item.total_in,
      };
    });

    stockOutByCategory.forEach((item) => {
      if (categoryMap[item.description]) {
        categoryMap[item.description].stockOut = item.total_out;
        categoryMap[item.description].currentStock -= item.total_out;
      } else {
        categoryMap[item.description] = {
          description: item.description,
          stockIn: 0,
          stockOut: item.total_out,
          currentStock: -item.total_out,
        };
      }
    });

    res.json(Object.values(categoryMap));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ======================================================
                LEDGER ROUTES
====================================================== */

// Supplier Ledger
router.get("/supplier-ledger/:supplierName", (req, res) => {
  try {
    const ledger = db
      .prepare(
        `
      SELECT * FROM supplier_ledger
      WHERE supplier_name = ?
      ORDER BY date DESC, id DESC
    `
      )
      .all(req.params.supplierName);

    res.json(ledger);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Customer Ledger
router.get("/customer-ledger/:customerName", (req, res) => {
  try {
    const ledger = db
      .prepare(
        `
      SELECT * FROM customer_ledger
      WHERE customer_name = ?
      ORDER BY date DESC, id DESC
    `
      )
      .all(req.params.customerName);

    res.json(ledger);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// All suppliers with ledger
router.get("/suppliers-with-ledger", (req, res) => {
  try {
    const suppliers = db.prepare("SELECT * FROM suppliers").all();

    const result = suppliers.map((s) => {
      const ledger = db
        .prepare(
          `
        SELECT * FROM supplier_ledger
        WHERE supplier_name = ?
        ORDER BY date DESC, id DESC
      `
        )
        .all(s.name);

      return { ...s, ledger };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// All customers with ledger
router.get("/customers-with-ledger", (req, res) => {
  try {
    const customers = db.prepare("SELECT * FROM customers").all();

    const result = customers.map((c) => {
      const ledger = db
        .prepare(
          `
        SELECT * FROM customer_ledger
        WHERE customer_name = ?
        ORDER BY date DESC, id DESC
      `
        )
        .all(c.name);

      return { ...c, ledger };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;