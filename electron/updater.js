/**
 * Auto Updater Manager
 * Handles automatic updates using electron-updater
 */

import { autoUpdater } from 'electron-updater';
import { dialog } from 'electron';

class UpdaterManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.setupAutoUpdater();
  }

  setupAutoUpdater() {
    // Configure auto-updater
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    // Update available
    autoUpdater.on('update-available', (info) => {
      console.log('Update available:', info);
      
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Update Available',
        message: `A new version (${info.version}) is available. Would you like to download it?`,
        buttons: ['Download', 'Later'],
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
    });

    // Update not available
    autoUpdater.on('update-not-available', () => {
      console.log('No updates available');
    });

    // Download progress
    autoUpdater.on('download-progress', (progressObj) => {
      const percent = Math.round(progressObj.percent);
      console.log(`Download progress: ${percent}%`);
      
      // Send progress to renderer
      this.mainWindow.webContents.send('update-download-progress', percent);
    });

    // Update downloaded
    autoUpdater.on('update-downloaded', (info) => {
      console.log('Update downloaded:', info);
      
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Update Ready',
        message: 'Update downloaded. The app will restart to install the update.',
        buttons: ['Restart Now', 'Later'],
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall(false, true);
        }
      });
    });

    // Error handling
    autoUpdater.on('error', (error) => {
      console.error('Auto-updater error:', error);
      
      dialog.showErrorBox(
        'Update Error',
        'An error occurred while checking for updates. Please try again later.'
      );
    });
  }

  checkForUpdates() {
    autoUpdater.checkForUpdates();
  }

  downloadUpdate() {
    autoUpdater.downloadUpdate();
  }

  quitAndInstall() {
    autoUpdater.quitAndInstall(false, true);
  }
}

export default UpdaterManager;
