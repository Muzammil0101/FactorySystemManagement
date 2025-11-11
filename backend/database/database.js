import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const dbPath = path.join(__dirname, 'facsys.db');
const db = new Database(dbPath);

// Initialize tables
function init() {
  // categories
  db.prepare(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
  )`).run();

  // suppliers
  db.prepare(`CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT
  )`).run();

  // customers
  db.prepare(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT
  )`).run();

  // products
  db.prepare(`CREATE TABLE IF NOT EXISTS products (
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
  )`).run();

  // purchases
  db.prepare(`CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    supplier_id INTEGER,
    qty INTEGER,
    cost_price REAL,
    date TEXT,
    total REAL,
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
  )`).run();

  // sales
  db.prepare(`CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    customer_id INTEGER,
    qty INTEGER,
    sell_price REAL,
    date TEXT,
    total REAL,
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(customer_id) REFERENCES customers(id)
  )`).run();

  // transactions
  db.prepare(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    product_id INTEGER,
    qty INTEGER,
    amount REAL,
    date TEXT
  )`).run();
}

// Initialize DB
init();

// Export the database instance
export default db;