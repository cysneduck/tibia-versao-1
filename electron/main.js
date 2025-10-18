/**
 * Electron Main Process
 * Entry point for the desktop application
 */

const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const channels = require('./ipcChannels');
const WindowManager = require('./windowManager');
const TrayManager = require('./trayManager');
const NotificationWindowManager = require('./notificationWindow');
const UrgentClaimWindow = require('./urgentClaimWindow');
const SoundManager = require('./soundManager');
const AutoLauncher = require('./autoLauncher');
const UpdaterManager = require('./updater');

// Keep a global reference of the window object
let mainWindow = null;
let windowManager = null;
let trayManager = null;
let notificationManager = null;
let urgentClaimWindow = null;
let soundManager = null;
let autoLauncher = null;
let updaterManager = null;

const isDev = process.env.NODE_ENV === 'development';
const isMac = process.platform === 'darwin';

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, focus our window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, '../public/pwa-512x512.png'),
    show: false, // Don't show until ready
  });

  // Initialize managers
  windowManager = new WindowManager(mainWindow);
  trayManager = new TrayManager(mainWindow);
  notificationManager = new NotificationWindowManager();
  urgentClaimWindow = new UrgentClaimWindow(mainWindow);
  soundManager = new SoundManager();
  autoLauncher = new AutoLauncher();
  
  if (!isDev) {
    updaterManager = new UpdaterManager(mainWindow);
  }

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window close
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      windowManager.minimizeToTray();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

// IPC Handlers

// Notification System
ipcMain.on(channels.SHOW_NOTIFICATION, (event, data) => {
  notificationManager.showNotification(data);
});

ipcMain.on(channels.SHOW_URGENT_CLAIM, (event, data) => {
  urgentClaimWindow.show(data);
  soundManager.playUrgentSound();
  if (process.platform === 'win32') {
    mainWindow.flashFrame(true);
  } else if (isMac) {
    app.dock.bounce('critical');
  }
});

ipcMain.on(channels.CLOSE_NOTIFICATION, (event, id) => {
  notificationManager.closeNotification(id);
});

// Sound System
ipcMain.on(channels.PLAY_SOUND, (event, { soundType, priority }) => {
  soundManager.playSound(soundType, priority);
});

ipcMain.on(channels.STOP_SOUND, () => {
  soundManager.stopAll();
});

ipcMain.on(channels.SET_SOUND_VOLUME, (event, volume) => {
  soundManager.setVolume(volume);
});

// Window Management
ipcMain.on(channels.MINIMIZE_WINDOW, () => {
  windowManager.minimize();
});

ipcMain.on(channels.MAXIMIZE_WINDOW, () => {
  windowManager.maximize();
});

ipcMain.on(channels.CLOSE_WINDOW, () => {
  windowManager.minimizeToTray();
});

ipcMain.on(channels.RESTORE_WINDOW, () => {
  windowManager.restore();
});

ipcMain.on(channels.HIDE_WINDOW, () => {
  mainWindow.hide();
});

ipcMain.on(channels.SHOW_WINDOW, () => {
  mainWindow.show();
});

ipcMain.on(channels.FLASH_FRAME, (event, flag) => {
  mainWindow.flashFrame(flag);
});

ipcMain.on(channels.FOCUS_WINDOW, () => {
  mainWindow.focus();
});

// System Tray
ipcMain.on(channels.UPDATE_TRAY_BADGE, (event, count) => {
  trayManager.updateBadge(count);
});

ipcMain.on(channels.UPDATE_TRAY_TITLE, (event, title) => {
  trayManager.updateTitle(title);
});

// Settings
ipcMain.handle(channels.GET_SETTINGS, async () => {
  return {
    autoLaunch: await autoLauncher.isEnabled(),
    version: app.getVersion(),
  };
});

ipcMain.on(channels.SET_SETTINGS, (event, settings) => {
  // Store settings (could use electron-store here)
  console.log('Settings updated:', settings);
});

ipcMain.handle(channels.AUTO_LAUNCH_ENABLE, async () => {
  return await autoLauncher.enable();
});

ipcMain.handle(channels.AUTO_LAUNCH_DISABLE, async () => {
  return await autoLauncher.disable();
});

ipcMain.handle(channels.AUTO_LAUNCH_STATUS, async () => {
  return await autoLauncher.isEnabled();
});

// Updates
ipcMain.on(channels.CHECK_FOR_UPDATES, () => {
  if (updaterManager) {
    updaterManager.checkForUpdates();
  }
});

ipcMain.on(channels.INSTALL_UPDATE, () => {
  if (updaterManager) {
    updaterManager.quitAndInstall();
  }
});

// App Info
ipcMain.handle(channels.GET_APP_VERSION, () => {
  return app.getVersion();
});

// Navigation
ipcMain.on(channels.NAVIGATE_TO, (event, path) => {
  // Send navigation command back to renderer
  mainWindow.webContents.send('navigate', path);
});

// Quit app
ipcMain.on(channels.APP_QUIT, () => {
  app.quit();
});
