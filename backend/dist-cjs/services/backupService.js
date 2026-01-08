"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initBackupService = exports.getLatestBackupPath = exports.createBackup = void 0;
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
var _nodeCron = _interopRequireDefault(require("node-cron"));
var _url = require("url");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Fix __dirname for ES modules
const _filename = (0, _url.fileURLToPath)(require('url').pathToFileURL(_filename).toString());
const _dirname = _path.default.dirname(_filename);
const isPackaged = typeof process.pkg !== 'undefined';
// If packaged, run relative to the executable. If not, run relative to this file's parent (backend root)
const rootDir = isPackaged ? _path.default.dirname(process.execPath) : _path.default.join(_dirname, '..');
const dbPath = _path.default.join(rootDir, 'facsys.db');
const backupDir = _path.default.join(rootDir, 'backups');

// Ensure backup directory exists
if (!_fs.default.existsSync(backupDir)) {
  _fs.default.mkdirSync(backupDir, {
    recursive: true
  });
}

// Function to create a backup
const createBackup = () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `facsys_backup_${timestamp}.db`;
    const backupPath = _path.default.join(backupDir, backupFile);

    // Copy database file
    _fs.default.copyFileSync(dbPath, backupPath);
    console.log(`✅ Backup created: ${backupFile}`);

    // Cleanup old backups (keep last 30)
    cleanupOldBackups();
  } catch (error) {
    console.error('❌ Backup failed:', error);
  }
};

// Function to clean up old backups
exports.createBackup = createBackup;
const cleanupOldBackups = () => {
  try {
    const files = _fs.default.readdirSync(backupDir);
    const backupFiles = files.filter(file => file.startsWith('facsys_backup_') && file.endsWith('.db')).map(file => ({
      name: file,
      path: _path.default.join(backupDir, file),
      time: _fs.default.statSync(_path.default.join(backupDir, file)).mtime.getTime()
    })).sort((a, b) => b.time - a.time); // Sort newest first

    // Keep top 30, delete the rest
    if (backupFiles.length > 30) {
      const filesToDelete = backupFiles.slice(30);
      filesToDelete.forEach(file => {
        _fs.default.unlinkSync(file.path);
        console.log(`🗑️ Deleted old backup: ${file.name}`);
      });
    }
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

// Initialize Cron Job
const initBackupService = () => {
  console.log('⏳ Initializing Backup Service...');

  // Schedule task to run every day at midnight (00:00)
  _nodeCron.default.schedule('0 0 * * *', () => {
    console.log('⏰ Running scheduled backup...');
    createBackup();
  });

  // Run one immediately on startup if no backups exist
  const files = _fs.default.readdirSync(backupDir);
  if (files.length === 0) {
    console.log('🆕 No backups found. Creating initial backup...');
    createBackup();
  }
};
exports.initBackupService = initBackupService;
const getLatestBackupPath = () => {
  // Ensure specific file path logic if needed, but simple reading existing Logic
  // Just return the DB path for current download logic, OR 
  // If we want to download a backup specifically, we can implement that.
  // For "Download Backup" feature requested by user, usually downloading the *live* DB is risky if it's being written to.
  // Safest is to make a fresh copy and stream that, or stream the latest backup.
  // Let's stream the live DB file but Copy-on-Read effectively by just creating a temp backup or just streaming the file.
  // Actually, SQLite files can be copied while open.
  return dbPath;
};
exports.getLatestBackupPath = getLatestBackupPath;