const { app, BrowserWindow, shell, ipcMain, powerSaveBlocker, nativeTheme, session, Tray, Menu, nativeImage, globalShortcut } = require('electron');
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
  app.exit(0);
}

let mainWindow = null;
let splashWindow = null;
let powerSaveBlockerId = null;
let tray = null;
let rpc = null;
let rpcReady = false;
let isPipWindowMode = false;
let prePipBounds = null;

const DISCORD_CLIENT_ID = '1150493863777599548';

// Widevine CDM configuration for DRM streaming
app.commandLine.appendSwitch('widevine-cdm-path', path.join(__dirname, 'WidevineCdm'));
app.commandLine.appendSwitch('widevine-cdm-version', '4.10.2891.0');

// Linux sandbox compatibility for NTFS/external drives
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu-sandbox');

// Prevent Chromium restore / crash bubble dialogs from interrupting startup
app.commandLine.appendSwitch('hide-crash-restore-bubble');
app.commandLine.appendSwitch('disable-session-crashed-bubble');
app.commandLine.appendSwitch('disable-features', 'SessionCrashedBubble');

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

// Create dedicated splash screen window for instant animation
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 480,
    height: 340,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    center: true,
    show: true,
    backgroundColor: '#00000000',
    icon: getIconPath(),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html')).catch(() => {});
}

// Setup Ad & Tracker Shield
function setupAdBlocker() {
  const AD_FILTER = {
    urls: [
      '*://*.doubleclick.net/*',
      '*://*.googlesyndication.com/*',
      '*://*.google-analytics.com/*',
      '*://*.scorecardresearch.com/*',
      '*://*.quantserve.com/*',
      '*://*.adservice.google.com/*',
      '*://*.amazon-adsystem.com/*',
      '*://*.criteo.com/*',
      '*://*.taboola.com/*',
      '*://*.outbrain.com/*',
      '*://*.adroll.com/*',
      '*://*.popads.net/*',
      '*://*.braze.com/*',
      '*://*.branch.io/*',
      '*://*.appboy.com/*',
      '*://*.adjust.com/*',
      '*://*.vungle.com/*',
      '*://*.flashtalking.com/*'
    ]
  };
  try {
    session.defaultSession.webRequest.onBeforeRequest(AD_FILTER, (details, callback) => {
      callback({ cancel: true });
    });
  } catch (e) {}
}

// Discord Rich Presence Setup
function initDiscordRPC() {
  try {
    let DiscordRPC;
    try {
      DiscordRPC = require('discord-rpc');
    } catch (e) {
      return;
    }

    DiscordRPC.register(DISCORD_CLIENT_ID);
    rpc = new DiscordRPC.Client({ transport: 'ipc' });

    rpc.on('ready', () => {
      rpcReady = true;
      updateDiscordPresence({
        details: 'Browsing Anime',
        state: 'Crunchyroll Desktop'
      });
    });

    rpc.on('error', () => {
      rpcReady = false;
    });

    rpc.login({ clientId: DISCORD_CLIENT_ID }).catch(() => {
      rpcReady = false;
    });
  } catch (err) {
    rpcReady = false;
  }
}

function updateDiscordPresence(data) {
  if (!rpc || !rpcReady) return;
  try {
    const presence = {
      details: data.details || 'Watching Anime',
      state: data.state || 'Crunchyroll',
      largeImageKey: 'crunchyroll_logo',
      largeImageText: 'Crunchyroll Desktop',
      instance: false
    };

    if (data.isPlaying && data.duration && data.currentTime) {
      presence.startTimestamp = Math.floor(Date.now() - (data.currentTime * 1000));
      presence.endTimestamp = Math.floor(Date.now() + ((data.duration - data.currentTime) * 1000));
      presence.smallImageKey = 'play';
      presence.smallImageText = 'Playing';
    } else if (data.isPlaying) {
      presence.startTimestamp = Math.floor(Date.now());
      presence.smallImageKey = 'play';
      presence.smallImageText = 'Playing';
    } else {
      presence.smallImageKey = 'pause';
      presence.smallImageText = 'Paused';
    }

    if (data.watchUrl && data.watchUrl.startsWith('http')) {
      presence.buttons = [
        { label: 'Watch on Crunchyroll', url: data.watchUrl }
      ];
    }

    rpc.setActivity(presence).catch(() => {});
  } catch (e) {}
}

// System Tray Configuration
function setupTray() {
  if (tray) return;
  const iconPath = getIconPath();
  if (!iconPath) return;

  try {
    let trayIcon = nativeImage.createFromPath(iconPath);
    if (process.platform === 'linux' || process.platform === 'win32') {
      trayIcon = trayIcon.resize({ width: 22, height: 22 });
    }

    tray = new Tray(trayIcon);
    tray.setToolTip('Crunchyroll Desktop');

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show Crunchyroll',
        click: () => {
          if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      { type: 'separator' },
      {
        label: '▶ Play / ⏸ Pause',
        click: () => {
          if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('media-play-pause');
        }
      },
      {
        label: '⏭ Next Episode',
        click: () => {
          if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('media-next');
        }
      },
      {
        label: '🔇 Mute / Unmute',
        click: () => {
          if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('media-mute');
        }
      },
      { type: 'separator' },
      {
        label: '🍿 Explore Popular',
        click: () => {
          if (mainWindow) mainWindow.loadURL('https://www.crunchyroll.com/videos/popular');
        }
      },
      {
        label: '📅 Simulcasts',
        click: () => {
          if (mainWindow) mainWindow.loadURL('https://www.crunchyroll.com/simulcasts');
        }
      },
      {
        label: '🔖 Watchlist',
        click: () => {
          if (mainWindow) mainWindow.loadURL('https://www.crunchyroll.com/watchlist');
        }
      },
      { type: 'separator' },
      {
        label: '⚙️ Preferences',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.webContents.send('open-preferences');
          }
        }
      },
      {
        label: '🚪 Quit',
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible() && !mainWindow.isMinimized()) {
          mainWindow.hide();
        } else {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });
  } catch (err) {
    console.warn('System tray notice:', err);
  }
}

// Global Media Key Handlers
function setupGlobalShortcuts() {
  try {
    globalShortcut.register('MediaPlayPause', () => {
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('media-play-pause');
    });
    globalShortcut.register('MediaNextTrack', () => {
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('media-next');
    });
    globalShortcut.register('MediaPreviousTrack', () => {
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('media-prev');
    });
    globalShortcut.register('MediaStop', () => {
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('media-stop');
    });
  } catch (e) {}
}

function createWindow() {
  createSplashWindow();

  mainWindow = new BrowserWindow({
    title: 'Crunchyroll',
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 500,
    show: false,
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

  // Once ready or timeout, smoothly transition from splash to main window
  let windowShown = false;
  const revealMainWindow = () => {
    if (windowShown) return;
    windowShown = true;

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
    }
    if (splashWindow && !splashWindow.isDestroyed()) {
      setTimeout(() => {
        if (splashWindow && !splashWindow.isDestroyed()) {
          splashWindow.close();
          splashWindow = null;
        }
      }, 400);
    }
  };

  mainWindow.once('ready-to-show', () => {
    // Show splash animation for at least 1.2s for pleasant visual experience
    setTimeout(revealMainWindow, 1200);
  });

  // Fallback reveal in case network is slow
  setTimeout(revealMainWindow, 3000);

  // Prevent unauthorized devtools shortcuts in production
  mainWindow.webContents.on('before-input-event', (event, input) => {
    const isDevToolsKey =
      input.key === 'F12' ||
      ((input.control || input.meta) && input.shift && input.key.toLowerCase() === 'i');

    if (isDevToolsKey && !process.env.ELECTRON_DEBUG) {
      event.preventDefault();
    }
  });

  // Handle external links
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

  function checkCanGoBack() {
    if (!mainWindow || mainWindow.isDestroyed()) return false;
    if (mainWindow.webContents.navigationHistory) {
      return mainWindow.webContents.navigationHistory.canGoBack();
    }
    return mainWindow.webContents.canGoBack ? mainWindow.webContents.canGoBack() : false;
  }

  function checkCanGoForward() {
    if (!mainWindow || mainWindow.isDestroyed()) return false;
    if (mainWindow.webContents.navigationHistory) {
      return mainWindow.webContents.navigationHistory.canGoForward();
    }
    return mainWindow.webContents.canGoForward ? mainWindow.webContents.canGoForward() : false;
  }

  // Mouse Back / Forward navigation
  mainWindow.on('app-command', (e, cmd) => {
    if (cmd === 'browser-backward' && checkCanGoBack()) {
      if (mainWindow.webContents.navigationHistory) mainWindow.webContents.navigationHistory.goBack();
      else mainWindow.webContents.goBack();
    } else if (cmd === 'browser-forward' && checkCanGoForward()) {
      if (mainWindow.webContents.navigationHistory) mainWindow.webContents.navigationHistory.goForward();
      else mainWindow.webContents.goForward();
    }
  });

  // Track navigation state changes
  const sendNavState = () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('nav-state-changed', {
        canGoBack: checkCanGoBack(),
        canGoForward: checkCanGoForward()
      });
    }
  };

  mainWindow.webContents.on('did-navigate', sendNavState);
  mainWindow.webContents.on('did-navigate-in-page', sendNavState);

  // Handle renderer crashes & unresponsiveness gracefully
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.warn('Renderer process gone:', details.reason);
    if (details.reason !== 'clean-exit' && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.reload();
    }
  });

  mainWindow.on('unresponsive', () => {
    console.warn('Crunchyroll window temporarily unresponsive.');
  });

  mainWindow.on('responsive', () => {
    console.log('Crunchyroll window responsive again.');
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      // Keep running in tray on Linux/Windows/Mac
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (powerSaveBlockerId !== null && powerSaveBlocker.isStarted(powerSaveBlockerId)) {
      powerSaveBlocker.stop(powerSaveBlockerId);
      powerSaveBlockerId = null;
    }
  });
}

// Global exception safety guards to prevent unhandled crash exits
process.on('uncaughtException', (err) => {
  console.error('Unhandled Exception caught safely:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection caught safely:', reason);
});

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
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.webContents.navigationHistory && mainWindow.webContents.navigationHistory.canGoBack()) {
    mainWindow.webContents.navigationHistory.goBack();
  } else if (mainWindow.webContents.canGoBack && mainWindow.webContents.canGoBack()) {
    mainWindow.webContents.goBack();
  }
});

ipcMain.on('nav-forward', () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.webContents.navigationHistory && mainWindow.webContents.navigationHistory.canGoForward()) {
    mainWindow.webContents.navigationHistory.goForward();
  } else if (mainWindow.webContents.canGoForward && mainWindow.webContents.canGoForward()) {
    mainWindow.webContents.goForward();
  }
});

ipcMain.on('nav-reload', () => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.reload();
});

ipcMain.on('nav-home', () => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.loadURL('https://www.crunchyroll.com');
});

ipcMain.on('nav-url', (event, url) => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.loadURL(url);
});

ipcMain.handle('get-nav-state', () => {
  if (!mainWindow || mainWindow.isDestroyed()) return { canGoBack: false, canGoForward: false };
  const canBack = mainWindow.webContents.navigationHistory ? mainWindow.webContents.navigationHistory.canGoBack() : (mainWindow.webContents.canGoBack ? mainWindow.webContents.canGoBack() : false);
  const canFwd = mainWindow.webContents.navigationHistory ? mainWindow.webContents.navigationHistory.canGoForward() : (mainWindow.webContents.canGoForward ? mainWindow.webContents.canGoForward() : false);
  return {
    canGoBack: canBack,
    canGoForward: canFwd
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

// Floating Mini-Player IPC
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

ipcMain.on('update-discord-rpc', (event, data) => {
  updateDiscordPresence(data);
});

// App Lifecycle
app.whenReady().then(() => {
  nativeTheme.themeSource = 'system';
  
  setupAdBlocker();
  createWindow();
  setupTray();
  setupGlobalShortcuts();
  initDiscordRPC();

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
    } else if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (rpc) {
    try { rpc.destroy(); } catch (e) {}
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
