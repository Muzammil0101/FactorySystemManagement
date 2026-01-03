// const { app, BrowserWindow, screen, protocol, net } = require('electron');
// const path = require('path');
// const { spawn } = require('child_process');
// const fs = require('fs');
// const os = require('os');
// const { pathToFileURL } = require('url');

// const logPath = path.join(os.homedir(), 'facsys_debug.log');

// function log(message) {
//     const timestamp = new Date().toISOString();
//     const logMessage = `${timestamp}: ${message}\n`;
//     fs.appendFileSync(logPath, logMessage);
// }

// // Register custom protocol
// protocol.registerSchemesAsPrivileged([
//     { scheme: 'app', privileges: { secure: true, standard: true, supportFetchAPI: true, corsEnabled: true } }
// ]);

// let mainWindow;
// let backendProcess;

// function createWindow() {
//     log('Creating window...');
//     const { width, height } = screen.getPrimaryDisplay().workAreaSize;

//     mainWindow = new BrowserWindow({
//         width: width,
//         height: height,
//         webPreferences: {
//             preload: path.join(__dirname, 'preload.js'),
//             nodeIntegration: false,
//             contextIsolation: true,
//         },
//     });

//     if (!app.isPackaged) {
//         mainWindow.loadURL('http://localhost:3000');
//         mainWindow.webContents.openDevTools();
//     } else {
//         // Load via custom protocol
//         log(`Loading app via app://facsys/index.html`);
//         mainWindow.loadURL('app://facsys/index.html');
//         // mainWindow.webContents.openDevTools(); 
//         mainWindow.webContents.openDevTools();
//     }

//     mainWindow.on('closed', () => {
//         mainWindow = null;
//     });
// }

// function startBackend() {
//     log(`app.isPackaged: ${app.isPackaged}`);
//     if (!app.isPackaged) {
//         console.log('In dev mode, assuming backend is running separately.');
//         log('In dev mode (app.isPackaged=false), skipping backend spawn.');
//     } else {
//         try {
//             const backendPath = path.join(process.resourcesPath, 'bin', 'backend');
//             log(`Attempting to start backend from: ${backendPath}`);

//             if (!fs.existsSync(backendPath)) {
//                 log('CRITICAL: Backend binary not found at path!');
//             }

//             backendProcess = spawn(backendPath, [], {
//                 stdio: ['ignore', 'pipe', 'pipe']
//             });

//             backendProcess.stdout.on('data', (data) => {
//                 log(`Backend STDOUT: ${data}`);
//             });

//             backendProcess.stderr.on('data', (data) => {
//                 log(`Backend STDERR: ${data}`);
//             });

//             backendProcess.on('error', (err) => {
//                 log(`Failed to start backend: ${err.message}`);
//             });

//             backendProcess.on('exit', (code, signal) => {
//                 log(`Backend process exited with code ${code} and signal ${signal}`);
//             });

//             log('Backend spawn command issued.');
//         } catch (e) {
//             log(`Exception starting backend: ${e.message}`);
//         }
//     }
// }

// app.whenReady().then(() => {
//     // Handle app:// protocol
//     protocol.handle('app', (request) => {
//         try {
//             let urlPath = request.url.slice('app://facsys/'.length);
//             // Remove query parameters/fragments
//             const queryIndex = urlPath.indexOf('?');
//             if (queryIndex !== -1) urlPath = urlPath.slice(0, queryIndex);

//             // Default to index.html for root
//             if (urlPath === '' || urlPath === '/') {
//                 urlPath = 'index.html';
//             }

//             // Base directory
//             const distPath = path.join(__dirname, '../out');
//             let filePath = path.join(distPath, urlPath);

//             log(`[Request] ${request.url} -> ${filePath}`);

//             // DEBUG: List files in distPath once to verify structure
//             if (urlPath === 'index.html') {
//                 try {
//                     const files = fs.readdirSync(distPath);
//                     log(`[Debug] Files in out: ${files.join(', ')}`);
//                 } catch (e) { log(`[Debug] Failed to read out dir: ${e.message}`); }
//             }

//             // Check file status
//             let stats = null;
//             try {
//                 stats = fs.statSync(filePath);
//             } catch (e) {
//                 // File does not exist
//             }

//             // If it's a directory or doesn't exist, try to find the correct HTML file
//             if (stats && stats.isDirectory()) {
//                 // If it's a directory, check if a sibling .html file exists with the same name (Next.js export style)
//                 // e.g. /login -> /login directory exists, but we want /login.html
//                 if (fs.existsSync(filePath + '.html')) {
//                     filePath += '.html';
//                     log(`[Rewrite] Directory found, serving sibling HTML: ${filePath}`);
//                 } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
//                     filePath = path.join(filePath, 'index.html');
//                     log(`[Rewrite] Directory found, serving index.html: ${filePath}`);
//                 }
//             } else if (!stats) {
//                 if (fs.existsSync(filePath + '.html')) {
//                     filePath += '.html';
//                     log(`[Rewrite] File not found, serving .html: ${filePath}`);
//                 } else {
//                     log(`[404] File not found: ${filePath}`);
//                     return new Response('Not Found', { status: 404 });
//                 }
//             }

//             return net.fetch(pathToFileURL(filePath).toString());
//         } catch (error) {
//             log(`[Protocol Error] ${error.message}`);
//             return new Response('Error', { status: 500 });
//         }
//     });

//     log('App Ready - Protocol Registered');
//     startBackend();
//     createWindow();

//     app.on('activate', () => {
//         if (BrowserWindow.getAllWindows().length === 0) {
//             createWindow();
//         }
//     });
// });

// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') {
//         app.quit();
//     }
// });

// app.on('will-quit', () => {
//     if (backendProcess) {
//         backendProcess.kill();
//     }
// });

const { app, BrowserWindow, screen, protocol, net } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const { pathToFileURL } = require('url');

// Logging setup
const logPath = path.join(os.homedir(), 'facsys_debug.log');

function log(message) {
    try {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp}: ${message}\n`;
        fs.appendFileSync(logPath, logMessage);
        // Also log to console for dev visibility
        console.log(message);
    } catch (err) {
        console.error("Failed to write to log file:", err);
    }
}

// Register custom protocol
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true, supportFetchAPI: true, corsEnabled: true } }
]);

let mainWindow;
let backendProcess;

function createWindow() {
    log('Creating window...');
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    if (!app.isPackaged) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        log(`Loading app via app://facsys/index.html`);
        mainWindow.loadURL('app://facsys/index.html');
        // mainWindow.webContents.openDevTools(); // Optional in prod
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function startBackend() {
    log(`Starting Backend. app.isPackaged: ${app.isPackaged}`);

    let executablePath;
    let args = [];
    let cwd;

    if (!app.isPackaged) {
        // --- DEVELOPMENT MODE ---
        log('Running in Dev Mode.');

        // POINT THIS TO YOUR ACTUAL BACKEND ENTRY FILE
        // Example: If your structure is root/electron/main.js and root/backend/server.js
        const backendScript = path.join(__dirname, '../../backend/server.js'); // <--- ADJUST THIS PATH

        if (fs.existsSync(backendScript)) {
            log(`Found dev backend script: ${backendScript}`);
            executablePath = 'node'; // We spawn 'node'
            args = [backendScript];  // With the script as argument
        } else {
            log(`CRITICAL: Backend script not found at ${backendScript}. Please check path in main.js`);
            return;
        }
    } else {
        // --- PRODUCTION MODE ---
        // Path to the packaged binary
        const binaryName = process.platform === 'win32' ? 'backend.exe' : 'backend';
        executablePath = path.join(process.resourcesPath, 'bin', binaryName);

        log(`Attempting to start production backend from: ${executablePath}`);

        if (!fs.existsSync(executablePath)) {
            log(`CRITICAL: Backend binary not found at ${executablePath}`);
            return;
        }

        // FIX: Ensure binary is executable on Mac/Linux
        if (process.platform !== 'win32') {
            try {
                log('Setting executable permissions (chmod +x)...');
                fs.chmodSync(executablePath, '755');
            } catch (e) {
                log(`Error setting permissions: ${e.message}`);
            }
        }
    }

    // --- SPAWN PROCESS ---
    try {
        backendProcess = spawn(executablePath, args, {
            cwd: cwd, // Optional
            stdio: ['ignore', 'pipe', 'pipe'],
            // specific env vars if needed
            env: { ...process.env, PORT: '4000' }
        });

        log(`Backend spawned. PID: ${backendProcess.pid}`);

        backendProcess.stdout.on('data', (data) => {
            log(`[Backend API]: ${data}`);
        });

        backendProcess.stderr.on('data', (data) => {
            log(`[Backend Error]: ${data}`);
        });

        backendProcess.on('error', (err) => {
            log(`Failed to start backend process: ${err.message}`);
        });

        backendProcess.on('exit', (code, signal) => {
            log(`Backend process exited with code ${code} and signal ${signal}`);
        });

    } catch (e) {
        log(`Exception while spawning backend: ${e.message}`);
    }
}

app.whenReady().then(() => {
    // Handle app:// protocol
    protocol.handle('app', (request) => {
        try {
            let urlPath = request.url.slice('app://facsys/'.length);
            const queryIndex = urlPath.indexOf('?');
            if (queryIndex !== -1) urlPath = urlPath.slice(0, queryIndex);

            if (urlPath === '' || urlPath === '/') {
                urlPath = 'index.html';
            }

            const distPath = path.join(__dirname, '../out');
            let filePath = path.join(distPath, urlPath);

            // Handle clean URLs (Next.js style)
            let stats = null;
            try { stats = fs.statSync(filePath); } catch (e) { }

            if (stats && stats.isDirectory()) {
                if (fs.existsSync(filePath + '.html')) filePath += '.html';
                else if (fs.existsSync(path.join(filePath, 'index.html'))) filePath = path.join(filePath, 'index.html');
            } else if (!stats) {
                if (fs.existsSync(filePath + '.html')) filePath += '.html';
            }

            return net.fetch(pathToFileURL(filePath).toString());
        } catch (error) {
            log(`[Protocol Error] ${error.message}`);
            return new Response('Error', { status: 500 });
        }
    });

    log('App Ready - Protocol Registered');
    startBackend(); // Call the updated function
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    if (backendProcess) {
        log('Killing backend process...');
        backendProcess.kill();
    }
});