/**
 * Custom Notification Window Manager
 * Creates frameless, always-on-top notification windows (like Discord)
 */

import { BrowserWindow, screen } from 'electron';

class NotificationWindowManager {
  constructor() {
    this.notifications = new Map(); // Track active notification windows
    this.notificationQueue = [];
    this.maxVisible = 5; // Max notifications visible at once
    this.notificationHeight = 100;
    this.notificationWidth = 400;
    this.padding = 10;
  }

  showNotification(data) {
    const { id, title, message, type, respawnId, duration = 5000 } = data;

    // If too many notifications, queue it
    if (this.notifications.size >= this.maxVisible) {
      this.notificationQueue.push(data);
      return;
    }

    // Calculate position (bottom-right corner, stacked)
    const position = this.calculatePosition();

    // Create notification window
    const notificationWindow = new BrowserWindow({
      width: this.notificationWidth,
      height: this.notificationHeight,
      x: position.x,
      y: position.y,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Load notification HTML
    const notificationHtml = this.generateNotificationHtml(title, message, type);
    notificationWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(notificationHtml)}`);

    // Show with fade-in animation
    notificationWindow.once('ready-to-show', () => {
      notificationWindow.setOpacity(0);
      notificationWindow.show();
      
      // Fade in
      let opacity = 0;
      const fadeIn = setInterval(() => {
        opacity += 0.1;
        if (opacity >= 1) {
          clearInterval(fadeIn);
          notificationWindow.setOpacity(1);
        } else {
          notificationWindow.setOpacity(opacity);
        }
      }, 30);
    });

    // Handle click
    notificationWindow.on('click', () => {
      this.closeNotification(id);
      // Send event to main window to navigate
      if (respawnId) {
        const mainWindow = BrowserWindow.getAllWindows()[0];
        mainWindow.webContents.send('notification-clicked', { respawnId });
        mainWindow.show();
        mainWindow.focus();
      }
    });

    // Store notification
    this.notifications.set(id, notificationWindow);

    // Auto-close after duration
    setTimeout(() => {
      this.closeNotification(id);
    }, duration);
  }

  closeNotification(id) {
    const notificationWindow = this.notifications.get(id);
    if (!notificationWindow) return;

    // Fade out
    let opacity = 1;
    const fadeOut = setInterval(() => {
      opacity -= 0.1;
      if (opacity <= 0) {
        clearInterval(fadeOut);
        notificationWindow.close();
        this.notifications.delete(id);
        
        // Reposition remaining notifications
        this.repositionNotifications();
        
        // Show queued notification if any
        if (this.notificationQueue.length > 0) {
          const nextNotification = this.notificationQueue.shift();
          this.showNotification(nextNotification);
        }
      } else {
        notificationWindow.setOpacity(opacity);
      }
    }, 30);
  }

  calculatePosition() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    // Bottom-right corner
    const x = screenWidth - this.notificationWidth - this.padding;
    const y = screenHeight - (this.notificationHeight + this.padding) * (this.notifications.size + 1);

    return { x, y };
  }

  repositionNotifications() {
    let index = 0;
    this.notifications.forEach((window) => {
      const position = this.calculatePositionForIndex(index);
      window.setPosition(position.x, position.y, true);
      index++;
    });
  }

  calculatePositionForIndex(index) {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    const x = screenWidth - this.notificationWidth - this.padding;
    const y = screenHeight - (this.notificationHeight + this.padding) * (index + 1);

    return { x, y };
  }

  generateNotificationHtml(title, message, type) {
    const colors = {
      claim_ready: '#ef4444',
      claim_expiring: '#f59e0b',
      queue_update: '#3b82f6',
      system_alert: '#8b5cf6',
      default: '#6b7280',
    };

    const color = colors[type] || colors.default;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: transparent;
            cursor: pointer;
            overflow: hidden;
          }
          .notification {
            background: rgba(17, 24, 39, 0.98);
            border-left: 4px solid ${color};
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            height: 100px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .title {
            color: white;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 6px;
          }
          .message {
            color: rgba(255, 255, 255, 0.8);
            font-size: 13px;
            line-height: 1.4;
          }
          .notification:hover {
            background: rgba(31, 41, 55, 0.98);
          }
        </style>
      </head>
      <body>
        <div class="notification">
          <div class="title">${title}</div>
          <div class="message">${message}</div>
        </div>
      </body>
      </html>
    `;
  }

  closeAll() {
    this.notifications.forEach((window) => window.close());
    this.notifications.clear();
    this.notificationQueue = [];
  }
}

export default NotificationWindowManager;
