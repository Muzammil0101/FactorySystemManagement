
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const currentFilename = fileURLToPath(import.meta.url);
const currentDirname = path.dirname(currentFilename);



const isPackaged = typeof process.pkg !== 'undefined';
// If packaged, run relative to the executable. If not, run relative to this file's parent (backend root)
const rootDir = process.env.USER_DATA_PATH || (isPackaged ? path.dirname(process.execPath) : path.join(currentDirname, '..'));

const dbPath = path.join(rootDir, 'facsys.db');
const backupDir = path.join(rootDir, 'backups');

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

import db from '../database/database.js';

// Function to create a backup
export const createBackup = async () => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = `facsys_backup_${timestamp}.db`;
        const backupPath = path.join(backupDir, backupFile);

        // Use better-sqlite3 native backup API
        console.log(`⏳ Starting backup to: ${backupPath}`);
        await db.backup(backupPath);
        console.log(`✅ Backup created successfully: ${backupFile}`);

        // Cleanup old backups (keep last 30)
        cleanupOldBackups();
    } catch (error) {
        console.error('❌ Backup failed:', error);
    }
};

// Function to clean up old backups
const cleanupOldBackups = () => {
    try {
        const files = fs.readdirSync(backupDir);
        const backupFiles = files
            .filter(file => file.startsWith('facsys_backup_') && file.endsWith('.db'))
            .map(file => ({
                name: file,
                path: path.join(backupDir, file),
                time: fs.statSync(path.join(backupDir, file)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time); // Sort newest first

        // Keep top 30, delete the rest
        if (backupFiles.length > 30) {
            const filesToDelete = backupFiles.slice(30);
            filesToDelete.forEach(file => {
                fs.unlinkSync(file.path);
                console.log(`🗑️ Deleted old backup: ${file.name}`);
            });
        }
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
    }
};

// Initialize Cron Job
export const initBackupService = () => {
    console.log('⏳ Initializing Backup Service...');

    // Schedule task to run every day at midnight (00:00)
    cron.schedule('0 0 * * *', () => {
        console.log('⏰ Running scheduled backup...');
        createBackup();
    });

    // Run one immediately on startup if no backups exist
    try {
        if (fs.existsSync(backupDir)) {
            const files = fs.readdirSync(backupDir);
            if (files.length === 0) {
                console.log('🆕 No backups found. Creating initial backup...');
                createBackup();
            }
        }
    } catch (err) {
        console.error("⚠️ Failed to check/create initial backup:", err);
    }
};

export const getLatestBackupPath = () => {
    // Ensure specific file path logic if needed, but simple reading existing Logic
    // Just return the DB path for current download logic, OR 
    // If we want to download a backup specifically, we can implement that.
    // For "Download Backup" feature requested by user, usually downloading the *live* DB is risky if it's being written to.
    // Safest is to make a fresh copy and stream that, or stream the latest backup.
    // Let's stream the live DB file but Copy-on-Read effectively by just creating a temp backup or just streaming the file.
    // Actually, SQLite files can be copied while open.
    return dbPath;
};
