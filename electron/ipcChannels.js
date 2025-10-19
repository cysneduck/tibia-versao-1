/**
 * IPC Channel Definitions
 * Central registry of all IPC communication channels between main and renderer processes
 */

module.exports = {
  // Notification System
  SHOW_NOTIFICATION: 'show-notification',
  SHOW_URGENT_CLAIM: 'show-urgent-claim',
  CLOSE_NOTIFICATION: 'close-notification',
  NOTIFICATION_CLICKED: 'notification-clicked',
  
  // Sound System
  PLAY_SOUND: 'play-sound',
  STOP_SOUND: 'stop-sound',
  SET_SOUND_VOLUME: 'set-sound-volume',
  
  // Window Management
  MINIMIZE_WINDOW: 'minimize-window',
  MAXIMIZE_WINDOW: 'maximize-window',
  CLOSE_WINDOW: 'close-window',
  RESTORE_WINDOW: 'restore-window',
  HIDE_WINDOW: 'hide-window',
  SHOW_WINDOW: 'show-window',
  FLASH_FRAME: 'flash-frame',
  FOCUS_WINDOW: 'focus-window',
  
  // System Tray
  UPDATE_TRAY_BADGE: 'update-tray-badge',
  UPDATE_TRAY_TITLE: 'update-tray-title',
  UPDATE_TRAY_ICON: 'update-tray-icon',
  TRAY_CLICKED: 'tray-clicked',
  
  // App Settings
  GET_SETTINGS: 'get-settings',
  SET_SETTINGS: 'set-settings',
  AUTO_LAUNCH_ENABLE: 'auto-launch-enable',
  AUTO_LAUNCH_DISABLE: 'auto-launch-disable',
  AUTO_LAUNCH_STATUS: 'auto-launch-status',
  
  // Updates
  CHECK_FOR_UPDATES: 'check-for-updates',
  UPDATE_AVAILABLE: 'update-available',
  UPDATE_DOWNLOADED: 'update-downloaded',
  INSTALL_UPDATE: 'install-update',
  
  // App Control
  APP_READY: 'app-ready',
  APP_QUIT: 'app-quit',
  GET_APP_VERSION: 'get-app-version',
  
  // Navigation
  NAVIGATE_TO: 'navigate-to',
};
