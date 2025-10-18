/**
 * Native OS Notifications
 * Uses Electron's native notification API for system-level notifications
 */

const { Notification, app } = require('electron');

class NativeNotificationManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
  }

  showNotification(data) {
    const { title, message, type, respawnId, priority = 'normal' } = data;

    // Check if notifications are supported and allowed
    if (!Notification.isSupported()) {
      console.log('Notifications are not supported on this platform');
      return;
    }

    const notification = new Notification({
      title,
      body: message,
      icon: app.getAppPath() + '/public/pwa-512x512.png',
      urgency: this.mapPriorityToUrgency(priority),
      timeoutType: priority === 'high' ? 'never' : 'default',
      silent: false,
    });

    // Handle click
    notification.on('click', () => {
      this.mainWindow.show();
      this.mainWindow.focus();
      
      if (respawnId) {
        this.mainWindow.webContents.send('notification-clicked', { respawnId });
      }
    });

    // Show notification
    notification.show();

    // Platform-specific attention grabbing
    this.grabAttention(priority);

    return notification;
  }

  mapPriorityToUrgency(priority) {
    const urgencyMap = {
      high: 'critical',
      medium: 'normal',
      normal: 'low',
    };
    return urgencyMap[priority] || 'normal';
  }

  grabAttention(priority) {
    const platform = process.platform;

    if (priority === 'high') {
      if (platform === 'win32') {
        // Flash taskbar on Windows
        this.mainWindow.flashFrame(true);
        
        // Stop flashing after 5 seconds
        setTimeout(() => {
          this.mainWindow.flashFrame(false);
        }, 5000);
      } else if (platform === 'darwin') {
        // Bounce dock icon on macOS
        app.dock.bounce('critical');
      } else if (platform === 'linux') {
        // Set urgent hint on Linux
        this.mainWindow.setAlwaysOnTop(true);
        setTimeout(() => {
          this.mainWindow.setAlwaysOnTop(false);
        }, 100);
      }
    }
  }

  clearAttention() {
    if (process.platform === 'win32') {
      this.mainWindow.flashFrame(false);
    }
  }
}

module.exports = NativeNotificationManager;
