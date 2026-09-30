const { app, BrowserWindow, shell, ipcMain, powerSaveBlocker, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');

// Set application identity for OS taskbars and docks
app.setName('Crunchyroll');
app.setAppUserModelId('com.codesrahul.crunchyroll');
if (process.platform === 'linux') {
  app.setDesktopName('crunchyroll.desktop');
}

// Ensure single instance of the application
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

let mainWindow = null;
let powerSaveBlockerId = null;

// Widevine CDM configuration for DRM streaming
app.commandLine.appendSwitch('widevine-cdm-path', path.join(__dirname, 'WidevineCdm'));
app.commandLine.appendSwitch('widevine-cdm-version', '4.10.2891.0');

// Linux sandbox compatibility for NTFS/external drives
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu-sandbox');

// Hardware acceleration, video decoding, and Picture-in-Picture optimizations
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('enable-features', 'PictureInPicture,DocumentPictureInPictureAPI');

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
    title: 'Crunchyroll',
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
      contextIsolation: false,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
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

  // Handle mouse Back / Forward navigation buttons
  mainWindow.on('app-command', (e, cmd) => {
    if (cmd === 'browser-backward' && mainWindow.webContents.canGoBack()) {
      mainWindow.webContents.goBack();
    } else if (cmd === 'browser-forward' && mainWindow.webContents.canGoForward()) {
      mainWindow.webContents.goForward();
    }
  });

  // Track navigation state changes
  const sendNavState = () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('nav-state-changed', {
        canGoBack: mainWindow.webContents.canGoBack(),
        canGoForward: mainWindow.webContents.canGoForward()
      });
    }
  };

  mainWindow.webContents.on('did-navigate', sendNavState);
  mainWindow.webContents.on('did-navigate-in-page', sendNavState);

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

// Window Navigation & Control IPCs
ipcMain.on('nav-back', () => {
  if (mainWindow && mainWindow.webContents.canGoBack()) mainWindow.webContents.goBack();
});

ipcMain.on('nav-forward', () => {
  if (mainWindow && mainWindow.webContents.canGoForward()) mainWindow.webContents.goForward();
});

ipcMain.on('nav-reload', () => {
  if (mainWindow) mainWindow.webContents.reload();
});

ipcMain.on('nav-home', () => {
  if (mainWindow) mainWindow.loadURL('https://www.crunchyroll.com');
});

ipcMain.on('nav-url', (event, url) => {
  if (mainWindow) mainWindow.loadURL(url);
});

ipcMain.handle('get-nav-state', () => {
  return {
    canGoBack: mainWindow ? mainWindow.webContents.canGoBack() : false,
    canGoForward: mainWindow ? mainWindow.webContents.canGoForward() : false
  };
});

ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

let isPipWindowMode = false;
let prePipBounds = null;

ipcMain.handle('toggle-pip-window', () => {
  if (!mainWindow || mainWindow.isDestroyed()) return false;

  if (isPipWindowMode) {
    isPipWindowMode = false;
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setMinimumSize(800, 500);
    if (prePipBounds) {
      mainWindow.setBounds(prePipBounds);
    } else {
      mainWindow.setSize(1280, 720);
      mainWindow.center();
    }
    return false;
  } else {
    prePipBounds = mainWindow.getBounds();
    isPipWindowMode = true;
    const { screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    const pipWidth = 520;
    const pipHeight = 300;

    mainWindow.setMinimumSize(320, 180);
    mainWindow.setBounds({
      x: Math.round(width - pipWidth - 24),
      y: Math.round(height - pipHeight - 24),
      width: pipWidth,
      height: pipHeight
    });
    mainWindow.setAlwaysOnTop(true, 'floating');
    return true;
  }
});

ipcMain.handle('get-theme-info', () => {
  return {
    shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
    shouldUseHighContrastColors: nativeTheme.shouldUseHighContrastColors
  };
});

// App Lifecycle
app.whenReady().then(() => {
  nativeTheme.themeSource = 'system';
  
  createWindow();

  nativeTheme.on('updated', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('theme-changed', {
        shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
        shouldUseHighContrastColors: nativeTheme.shouldUseHighContrastColors
      });
    }
  });

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

