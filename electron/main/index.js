const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    show: true
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').catch(err => {
      console.error('Failed to load URL:', err);
    });
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html')).catch(err => {
      console.error('Failed to load file:', err);
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupIpcHandlers() {
  try {
    require('../ipc/browserIpc');
    require('../ipc/databaseIpc');
    require('../ipc/scraperIpc');
    require('../ipc/downloadIpc');

    ipcMain.handle('app:getPath', (event, name) => {
      return app.getPath(name);
    });

    ipcMain.handle('dialog:showOpen', async (event, options) => {
      return dialog.showOpenDialog(mainWindow, options);
    });

    ipcMain.handle('dialog:showSave', async (event, options) => {
      return dialog.showSaveDialog(mainWindow, options);
    });
  } catch (err) {
    console.error('IPC setup error:', err);
  }
}

app.whenReady().then(() => {
  console.log('App ready, creating window...');
  setupIpcHandlers();
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