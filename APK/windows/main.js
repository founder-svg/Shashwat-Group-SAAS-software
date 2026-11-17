const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: 'Shashwat Group - SaaS CRM, Billing & Inventory',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Remove default menu for a clean enterprise dashboard feel
  Menu.setApplicationMenu(null);

  // Load the built client or live deployed Netlify URL
  const productionUrl = 'https://keen-babka-8c2b51.netlify.app';
  mainWindow.loadURL(productionUrl).catch(() => {
    // Fallback to local built index.html if offline
    mainWindow.loadFile(path.join(__dirname, '../../client/dist/index.html'));
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
