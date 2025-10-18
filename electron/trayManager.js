/**
 * System Tray Manager
 * Creates and manages system tray icon with context menu
 */

const { app, Menu, Tray, nativeImage } = require('electron');
const path = require('path');

class TrayManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.tray = null;
    this.unreadCount = 0;
    this.createTray();
  }

  createTray() {
    const iconPath = path.join(__dirname, '../public/pwa-192x192.png');
    let icon = nativeImage.createFromPath(iconPath);
    
    // Resize for tray (platform-specific sizes)
    if (process.platform === 'darwin') {
      icon = icon.resize({ width: 22, height: 22 });
    } else if (process.platform === 'win32') {
      icon = icon.resize({ width: 16, height: 16 });
    }

    this.tray = new Tray(icon);
    this.updateTooltip('Claimed System');
    this.updateContextMenu();

    // Click to show/hide window
    this.tray.on('click', () => {
      if (this.mainWindow.isVisible()) {
        this.mainWindow.hide();
      } else {
        this.mainWindow.show();
        this.mainWindow.focus();
      }
    });
  }

  updateContextMenu() {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open Claimed System',
        click: () => {
          this.mainWindow.show();
          this.mainWindow.focus();
        },
      },
      { type: 'separator' },
      {
        label: `Unread: ${this.unreadCount}`,
        enabled: false,
      },
      { type: 'separator' },
      {
        label: 'Mute Notifications',
        type: 'checkbox',
        checked: false,
        click: (menuItem) => {
          // Send to renderer to update settings
          this.mainWindow.webContents.send('toggle-mute', menuItem.checked);
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.isQuitting = true;
          app.quit();
        },
      },
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  updateBadge(count) {
    this.unreadCount = count;
    
    // Update context menu
    this.updateContextMenu();
    
    // Update tooltip
    if (count > 0) {
      this.updateTooltip(`Claimed System - ${count} unread`);
    } else {
      this.updateTooltip('Claimed System');
    }

    // macOS: Update dock badge
    if (process.platform === 'darwin') {
      if (count > 0) {
        app.dock.setBadge(count.toString());
      } else {
        app.dock.setBadge('');
      }
    }

    // Windows: Flash frame if count increased
    if (process.platform === 'win32' && count > this.lastCount) {
      this.mainWindow.flashFrame(true);
      
      // Stop flashing after 3 seconds
      setTimeout(() => {
        this.mainWindow.flashFrame(false);
      }, 3000);
    }

    this.lastCount = count;
  }

  updateTitle(title) {
    this.updateTooltip(title);
  }

  updateTooltip(text) {
    this.tray.setToolTip(text);
  }

  flash() {
    // Animate tray icon (Windows only supports this well)
    if (process.platform === 'win32') {
      let flashCount = 0;
      const flashInterval = setInterval(() => {
        // Toggle between normal and highlighted icon
        flashCount++;
        if (flashCount >= 6) {
          clearInterval(flashInterval);
        }
      }, 500);
    }
  }

  destroy() {
    if (this.tray) {
      this.tray.destroy();
    }
  }
}

module.exports = TrayManager;
