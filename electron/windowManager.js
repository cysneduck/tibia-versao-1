/**
 * Window Manager
 * Handles main window lifecycle, minimize to tray, position memory
 */

const { app } = require('electron');
const Store = require('electron-store');

class WindowManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.store = new Store();
    this.isQuitting = false;
    
    // Restore window position and size
    this.restoreWindowBounds();
    
    // Save window position on move/resize
    this.setupPositionTracking();
  }

  restoreWindowBounds() {
    const bounds = this.store.get('windowBounds');
    if (bounds) {
      this.mainWindow.setBounds(bounds);
    }
  }

  setupPositionTracking() {
    // Debounce to avoid excessive saves
    let saveTimeout = null;
    
    const saveBounds = () => {
      if (!this.mainWindow.isMinimized() && !this.mainWindow.isMaximized()) {
        this.store.set('windowBounds', this.mainWindow.getBounds());
      }
    };

    this.mainWindow.on('resize', () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(saveBounds, 500);
    });

    this.mainWindow.on('move', () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(saveBounds, 500);
    });
  }

  minimize() {
    this.mainWindow.minimize();
  }

  maximize() {
    if (this.mainWindow.isMaximized()) {
      this.mainWindow.unmaximize();
    } else {
      this.mainWindow.maximize();
    }
  }

  restore() {
    if (this.mainWindow.isMinimized()) {
      this.mainWindow.restore();
    }
    this.mainWindow.show();
    this.mainWindow.focus();
  }

  minimizeToTray() {
    this.mainWindow.hide();
    
    // On macOS, show notification about minimize to tray (first time only)
    if (process.platform === 'darwin' && !this.store.get('trayNotificationShown')) {
      const { Notification } = require('electron');
      new Notification({
        title: 'Claimed System',
        body: 'App minimized to menu bar. Click the icon to restore.',
      }).show();
      this.store.set('trayNotificationShown', true);
    }
  }

  show() {
    this.mainWindow.show();
    this.mainWindow.focus();
  }

  hide() {
    this.mainWindow.hide();
  }

  focus() {
    if (this.mainWindow.isMinimized()) {
      this.mainWindow.restore();
    }
    this.mainWindow.show();
    this.mainWindow.focus();
  }

  flash(flag = true) {
    this.mainWindow.flashFrame(flag);
  }

  setAlwaysOnTop(flag) {
    this.mainWindow.setAlwaysOnTop(flag);
  }
}

module.exports = WindowManager;
