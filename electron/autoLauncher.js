/**
 * Auto Launch Manager
 * Handles app auto-start on system boot
 */

import { app } from 'electron';

class AutoLauncher {
  constructor() {
    this.appName = 'ClaimedSystem';
    
    // Auto-launch is built into Electron
    // On macOS: Uses Login Items
    // On Windows: Uses Registry
    // On Linux: Uses .desktop file
  }

  async enable() {
    try {
      app.setLoginItemSettings({
        openAtLogin: true,
        openAsHidden: true, // Start minimized to tray
        name: this.appName,
      });
      return true;
    } catch (error) {
      console.error('Failed to enable auto-launch:', error);
      return false;
    }
  }

  async disable() {
    try {
      app.setLoginItemSettings({
        openAtLogin: false,
        name: this.appName,
      });
      return true;
    } catch (error) {
      console.error('Failed to disable auto-launch:', error);
      return false;
    }
  }

  async isEnabled() {
    try {
      const settings = app.getLoginItemSettings();
      return settings.openAtLogin;
    } catch (error) {
      console.error('Failed to check auto-launch status:', error);
      return false;
    }
  }

  async toggle() {
    const isCurrentlyEnabled = await this.isEnabled();
    if (isCurrentlyEnabled) {
      return await this.disable();
    } else {
      return await this.enable();
    }
  }
}

export default AutoLauncher;
