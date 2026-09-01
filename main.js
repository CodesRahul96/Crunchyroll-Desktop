const { app, BrowserWindow, shell, ipcMain, powerSaveBlocker } = require('electron');
const path = require('path');
const fs = require('fs');

// Ensure single instance of the application
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

let mainWindow = null;
let powerSaveBlockerId = null;

// Configure Widevine CDM dynamically if local directory exists
const localWidevinePath = path.join(__dirname, 'WidevineCdm');
if (fs.existsSync(localWidevinePath)) {
  app.commandLine.appendSwitch('widevine-cdm-path', localWidevinePath);
  app.commandLine.appendSwitch('widevine-cdm-version', '4.10.2891.0');
}

// Hardware acceleration and video decoding optimizations
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');

function getIconPath() {
  const iconPng = path.join(__dirname, 'resources/app/icon.png');
  const iconIco = path.join(__dirname, 'resources/app/icon.ico');
  const iconIcns = path.join(__dirname, 'resources/app/icon.icns');

  if (process.platform === 'win32' && fs.existsSync(iconIco)) return iconIco;
  if (process.platform === 'darwin' && fs.existsSync(iconIcns)) return iconIcns;
  if (fs.existsSync(iconPng)) return iconPng;
  return undefined;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'Crunchyroll Desktop',
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 500,
    fullscreenable: true,
    autoHideMenuBar: true,
    resizable: true,
    backgroundColor: '#000000',
    icon: getIconPath(),
    webPreferences: {
      plugins: true,
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (process.platform !== 'darwin') {
    mainWindow.setMenu(null);
  }

  // Load Crunchyroll
  mainWindow.loadURL('https://www.crunchyroll.com');

  // Prevent unauthorized devtools shortcuts in production
  mainWindow.webContents.on('before-input-event', (event, input) => {
    const isDevToolsKey =
      input.key === 'F12' ||
      ((input.control || input.meta) && input.shift && input.key.toLowerCase() === 'i');

    if (isDevToolsKey && !process.env.ELECTRON_DEBUG) {
      event.preventDefault();
    }
  });

  // Handle external links: open non-Crunchyroll URLs in the user's default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const parsedUrl = new URL(url);
      const allowedHosts = ['crunchyroll.com', 'www.crunchyroll.com', 'beta.crunchyroll.com', 'accounts.crunchyroll.com'];
      
      const isAllowed = allowedHosts.some(host => parsedUrl.hostname === host || parsedUrl.hostname.endsWith('.' + host));
      if (!isAllowed) {
        shell.openExternal(url);
        return { action: 'deny' };
      }
    } catch {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (powerSaveBlockerId !== null && powerSaveBlocker.isStarted(powerSaveBlockerId)) {
      powerSaveBlocker.stop(powerSaveBlockerId);
      powerSaveBlockerId = null;
    }
  });
}

// Power save management during playback
ipcMain.on('playback-state-change', (event, isPlaying) => {
  if (isPlaying) {
    if (powerSaveBlockerId === null || !powerSaveBlocker.isStarted(powerSaveBlockerId)) {
      powerSaveBlockerId = powerSaveBlocker.start('prevent-display-sleep');
    }
  } else {
    if (powerSaveBlockerId !== null && powerSaveBlocker.isStarted(powerSaveBlockerId)) {
      powerSaveBlocker.stop(powerSaveBlockerId);
      powerSaveBlockerId = null;
    }
  }
});

// App Lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

