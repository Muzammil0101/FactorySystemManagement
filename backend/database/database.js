
// import path from 'path';
// import { fileURLToPath } from 'url';
// import Database from 'better-sqlite3';

// // Fix __dirname for ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const dbPath = path.join(__dirname, 'facsys.db');
// const db = new Database(dbPath);

// // Helper function to add column if missing
// function addColumnIfNotExists(table, column, type) {
//   try {
//     const columns = db.prepare(`PRAGMA table_info(${table})`).all();
//     const exists = columns.some(col => col.name === column);
//     if (!exists) {
//       db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`).run();
//       console.log(`✅ Added column '${column}' to '${table}'`);
//     }
//   } catch (error) {
//     // Table might not exist yet, which is fine
//   }
// }

// function init() {

//   // USERS
//   db.prepare(`
//     CREATE TABLE IF NOT EXISTS users (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       email TEXT UNIQUE NOT NULL,
//       password TEXT NOT NULL,
//       role TEXT DEFAULT 'admin'
//     )
//   `).run();

//   const ADMIN_EMAIL = "admin@buttmalik.com";
//   const ADMIN_PASSWORD = "admin123";

//   const hasAdmin = db.prepare("SELECT id FROM users WHERE email = ?").get(ADMIN_EMAIL);
//   if (!hasAdmin) {
//     db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)")
//       .run(ADMIN_EMAIL, ADMIN_PASSWORD, "admin");
//     console.log("✅ Default admin inserted");
//   }

//   // LOGIN LOGS
//   db.prepare(`
//     CREATE TABLE IF NOT EXISTS login_logs (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       email TEXT,
//       login_time TEXT,
//       ip_address TEXT
//     )
//   `).run();

//   // CATEGORIES
//   db.prepare(`
//     CREATE TABLE IF NOT EXISTS categories (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT UNIQUE NOT NULL,
//       description TEXT
//     )
//   `).run();

//   // CATEGORY INDEX
//   db.prepare(`CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name)`).run();

//   // SUPPLIERS
//   db.prepare(`
//     CREATE TABLE IF NOT EXISTS suppliers (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL,
//       phone TEXT
//     )
//   `).run();
//   addColumnIfNotExists("suppliers", "city", "TEXT");

//   // CUSTOMERS
//   db.prepare(`
//     CREATE TABLE IF NOT EXISTS customers (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL,
//       phone TEXT
//     )
//   `).run();
//   addColumnIfNotExists("customers", "city", "TEXT");

//   // STOCK IN
//   db.prepare(`
//     CREATE TABLE IF NOT EXISTS stock_in (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       date TEXT NOT NULL,
//       description TEXT NOT NULL,
//       weight REAL NOT NULL,
//       rate REAL NOT NULL,
//       amount REAL NOT NULL,
//       supplier TEXT NOT NULL,
//       created_at TEXT DEFAULT CURRENT_TIMESTAMP
//     )
//   `).run();

//   db.prepare(`CREATE INDEX IF NOT EXISTS idx_stockin_description ON stock_in(description)`).run();

//   // STOCK OUT
//   // 'rate' acts as Sale Rate
//   // 'purchase_rate' is the new field
//   db.prepare(`
//     CREATE TABLE IF NOT EXISTS stock_out (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       date TEXT NOT NULL,
//       description TEXT NOT NULL,
//       weight REAL NOT NULL,
//       rate REAL NOT NULL,
//       purchase_rate REAL DEFAULT 0, 
//       amount REAL NOT NULL,
//       customer TEXT NOT NULL,
//       created_at TEXT DEFAULT CURRENT_TIMESTAMP
//     )
//   `).run();

//   // Ensure the new column exists for existing databases
//   addColumnIfNotExists("stock_out", "purchase_rate", "REAL DEFAULT 0");

//   db.prepare(`CREATE INDEX IF NOT EXISTS idx_stockout_description ON stock_out(description)`).run();

//   // LEDGERS
//   db.prepare(`
//     CREATE TABLE IF NOT EXISTS supplier_ledger (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       supplier_name TEXT NOT NULL,
//       date TEXT NOT NULL,
//       description TEXT NOT NULL,
//       weight REAL,
//       rate REAL,
//       debit REAL DEFAULT 0,
//       credit REAL DEFAULT 0,
//       created_at TEXT DEFAULT CURRENT_TIMESTAMP
//     )
//   `).run();

//   db.prepare(`
//     CREATE TABLE IF NOT EXISTS customer_ledger (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       customer_name TEXT NOT NULL,
//       date TEXT NOT NULL,
//       description TEXT NOT NULL,
//       weight REAL,
//       rate REAL,
//       debit REAL DEFAULT 0,
//       credit REAL DEFAULT 0,
//       created_at TEXT DEFAULT CURRENT_TIMESTAMP
//     )
//   `).run();

//   // PRODUCTS
//   db.prepare(`
//     CREATE TABLE IF NOT EXISTS products (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL,
//       category_id INTEGER,
//       supplier_id INTEGER,
//       cost_price REAL DEFAULT 0,
//       sell_price REAL DEFAULT 0,
//       stock_qty INTEGER DEFAULT 0,
//       sku TEXT,
//       FOREIGN KEY(category_id) REFERENCES categories(id),
//       FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
//     )
//   `).run();

//   // PURCHASES
//   db.prepare(`
//     CREATE TABLE IF NOT EXISTS purchases (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       product_id INTEGER,
//       supplier_id INTEGER,
//       qty INTEGER,
//       cost_price REAL,
//       date TEXT,
//       total REAL,
//       FOREIGN KEY(product_id) REFERENCES products(id),
//       FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
//     )
//   `).run();

//   // SALES
//   db.prepare(`
//     CREATE TABLE IF NOT EXISTS sales (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       product_id INTEGER,
//       customer_id INTEGER,
//       qty INTEGER,
//       sell_price REAL,
//       date TEXT,
//       total REAL,
//       FOREIGN KEY(product_id) REFERENCES products(id),
//       FOREIGN KEY(customer_id) REFERENCES customers(id)
//     )
//   `).run();

//   // TRANSACTIONS
//   db.prepare(`
//     CREATE TABLE IF NOT EXISTS transactions (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       type TEXT,
//       product_id INTEGER,
//       qty INTEGER,
//       amount REAL,
//       date TEXT
//     )
//   `).run();

//   console.log("✅ Database initialized successfully");
// }

// init();

// export default db;

import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

// Fix __dirname for ES modules
// Fix __dirname for ES modules
const dbFilename = fileURLToPath(import.meta.url);
const dbDirname = path.dirname(dbFilename);

const isPackaged = typeof process.pkg !== 'undefined';
const dbFolder = isPackaged ? path.dirname(process.execPath) : dbDirname;
const dbPath = path.join(dbFolder, 'facsys.db');
const db = new Database(dbPath);

// Helper function to add column if missing
function addColumnIfNotExists(table, column, type) {
  try {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all();
    const exists = columns.some(col => col.name === column);
    if (!exists) {
      db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`).run();
      console.log(`✅ Added column '${column}' to '${table}'`);
    }
  } catch (error) {
    // Table might not exist yet, which is fine
  }
}

function init() {

  // USERS
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin'
    )
  `).run();

  const ADMIN_EMAIL = "admin@buttmalik.com";
  const ADMIN_PASSWORD = "admin123";

  const hasAdmin = db.prepare("SELECT id FROM users WHERE email = ?").get(ADMIN_EMAIL);
  if (!hasAdmin) {
    db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)")
      .run(ADMIN_EMAIL, ADMIN_PASSWORD, "admin");
    console.log("✅ Default admin inserted");
  }

  // LOGIN LOGS
  db.prepare(`
    CREATE TABLE IF NOT EXISTS login_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT,
      login_time TEXT,
      ip_address TEXT
    )
  `).run();

  // CATEGORIES
  db.prepare(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT
    )
  `).run();

  // CATEGORY INDEX
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name)`).run();

  // SUPPLIERS
  db.prepare(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT
    )
  `).run();
  addColumnIfNotExists("suppliers", "city", "TEXT");

  // CUSTOMERS
  db.prepare(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT
    )
  `).run();
  addColumnIfNotExists("customers", "city", "TEXT");

  // STOCK IN
  // Added 'details' field
  db.prepare(`
    CREATE TABLE IF NOT EXISTS stock_in (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      details TEXT, 
      weight REAL NOT NULL,
      rate REAL NOT NULL,
      amount REAL NOT NULL,
      supplier TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Ensure 'details' exists for existing databases
  addColumnIfNotExists("stock_in", "details", "TEXT");

  db.prepare(`CREATE INDEX IF NOT EXISTS idx_stockin_description ON stock_in(description)`).run();

  // STOCK OUT
  // Added 'details' field
  db.prepare(`
    CREATE TABLE IF NOT EXISTS stock_out (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      details TEXT,
      weight REAL NOT NULL,
      rate REAL NOT NULL,
      purchase_rate REAL DEFAULT 0, 
      amount REAL NOT NULL,
      customer TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Ensure columns exist for existing databases
  addColumnIfNotExists("stock_out", "purchase_rate", "REAL DEFAULT 0");
  addColumnIfNotExists("stock_out", "details", "TEXT");

  db.prepare(`CREATE INDEX IF NOT EXISTS idx_stockout_description ON stock_out(description)`).run();

  // LEDGERS
  db.prepare(`
    CREATE TABLE IF NOT EXISTS supplier_ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_name TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      weight REAL,
      rate REAL,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS customer_ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      weight REAL,
      rate REAL,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // PRODUCTS
  db.prepare(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER,
      supplier_id INTEGER,
      cost_price REAL DEFAULT 0,
      sell_price REAL DEFAULT 0,
      stock_qty INTEGER DEFAULT 0,
      sku TEXT,
      FOREIGN KEY(category_id) REFERENCES categories(id),
      FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
    )
  `).run();

  // PURCHASES
  db.prepare(`
    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      supplier_id INTEGER,
      qty INTEGER,
      cost_price REAL,
      date TEXT,
      total REAL,
      FOREIGN KEY(product_id) REFERENCES products(id),
      FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
    )
  `).run();

  // SALES
  db.prepare(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      customer_id INTEGER,
      qty INTEGER,
      sell_price REAL,
      date TEXT,
      total REAL,
      FOREIGN KEY(product_id) REFERENCES products(id),
      FOREIGN KEY(customer_id) REFERENCES customers(id)
    )
  `).run();

  // TRANSACTIONS
  db.prepare(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      product_id INTEGER,
      qty INTEGER,
      amount REAL,
      date TEXT
    )
  `).run();

  console.log("✅ Database initialized successfully");
}

init();

export default db;