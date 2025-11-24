const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let backendProcess;

function createWindow() {
  const win = new BrowserWindow({
    width: 1300,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadURL("http://localhost:3000");
}

app.whenReady().then(() => {
  // Start Backend Server
  backendProcess = spawn("node", ["../backend/server.js"], {
    cwd: path.join(__dirname, ".."),
    shell: true,
  });

  backendProcess.stdout.on("data", (data) =>
    console.log(`BACKEND: ${data}`)
  );

  backendProcess.stderr.on("data", (data) =>
    console.error(`BACKEND ERROR: ${data}`)
  );

  // Wait 1.5 seconds then load UI
  setTimeout(() => {
    createWindow();
  }, 1500);
});

app.on("window-all-closed", () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== "darwin") app.quit();
});