/**
 * Preload Script
 * Bridge between main and renderer processes
 * Exposes safe Electron APIs to React app via contextBridge
 */

const { contextBridge, ipcRenderer } = require('electron');

// IPC Channel constants (inlined to avoid ES module import issues)
const channels = {
  SHOW_NOTIFICATION: 'show-notification',
  SHOW_URGENT_CLAIM: 'show-urgent-claim',
  CLOSE_NOTIFICATION: 'close-notification',
  CLEAR_ALL_NOTIFICATIONS: 'clear-all-notifications',
  NOTIFICATION_CLICKED: 'notification-clicked',
  PLAY_SOUND: 'play-sound',
  STOP_SOUND: 'stop-sound',
  SET_SOUND_VOLUME: 'set-sound-volume',
  MINIMIZE_WINDOW: 'minimize-window',
  MAXIMIZE_WINDOW: 'maximize-window',
  CLOSE_WINDOW: 'close-window',
  RESTORE_WINDOW: 'restore-window',
  HIDE_WINDOW: 'hide-window',
  SHOW_WINDOW: 'show-window',
  FLASH_FRAME: 'flash-frame',
  FOCUS_WINDOW: 'focus-window',
  UPDATE_TRAY_BADGE: 'update-tray-badge',
  UPDATE_TRAY_TITLE: 'update-tray-title',
  TRAY_CLICKED: 'tray-clicked',
  GET_SETTINGS: 'get-settings',
  SET_SETTINGS: 'set-settings',
  AUTO_LAUNCH_ENABLE: 'auto-launch-enable',
  AUTO_LAUNCH_DISABLE: 'auto-launch-disable',
  AUTO_LAUNCH_STATUS: 'auto-launch-status',
  CHECK_FOR_UPDATES: 'check-for-updates',
  UPDATE_AVAILABLE: 'update-available',
  UPDATE_DOWNLOADED: 'update-downloaded',
  INSTALL_UPDATE: 'install-update',
  GET_APP_VERSION: 'get-app-version',
  NAVIGATE_TO: 'navigate-to',
};

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Notifications
  showNotification: (data) => ipcRenderer.send(channels.SHOW_NOTIFICATION, data),
  showUrgentClaim: (data) => ipcRenderer.send(channels.SHOW_URGENT_CLAIM, data),
  closeNotification: (id) => ipcRenderer.send(channels.CLOSE_NOTIFICATION, id),
  clearAllNotifications: () => ipcRenderer.send(channels.CLEAR_ALL_NOTIFICATIONS),
  onNotificationClicked: (callback) => ipcRenderer.on(channels.NOTIFICATION_CLICKED, callback),
  
  // Sounds
  playSound: (soundType, priority) => ipcRenderer.send(channels.PLAY_SOUND, { soundType, priority }),
  stopSound: () => ipcRenderer.send(channels.STOP_SOUND),
  setSoundVolume: (volume) => ipcRenderer.send(channels.SET_SOUND_VOLUME, volume),
  
  // Window Management
  minimizeWindow: () => ipcRenderer.send(channels.MINIMIZE_WINDOW),
  maximizeWindow: () => ipcRenderer.send(channels.MAXIMIZE_WINDOW),
  closeWindow: () => ipcRenderer.send(channels.CLOSE_WINDOW),
  restoreWindow: () => ipcRenderer.send(channels.RESTORE_WINDOW),
  hideWindow: () => ipcRenderer.send(channels.HIDE_WINDOW),
  showWindow: () => ipcRenderer.send(channels.SHOW_WINDOW),
  flashFrame: (flag) => ipcRenderer.send(channels.FLASH_FRAME, flag),
  focusWindow: () => ipcRenderer.send(channels.FOCUS_WINDOW),
  
  // System Tray
  updateTrayBadge: (count) => ipcRenderer.send(channels.UPDATE_TRAY_BADGE, count),
  updateTrayTitle: (title) => ipcRenderer.send(channels.UPDATE_TRAY_TITLE, title),
  onTrayClicked: (callback) => ipcRenderer.on(channels.TRAY_CLICKED, callback),
  
  // Settings
  getSettings: () => ipcRenderer.invoke(channels.GET_SETTINGS),
  setSettings: (settings) => ipcRenderer.send(channels.SET_SETTINGS, settings),
  enableAutoLaunch: () => ipcRenderer.invoke(channels.AUTO_LAUNCH_ENABLE),
  disableAutoLaunch: () => ipcRenderer.invoke(channels.AUTO_LAUNCH_DISABLE),
  getAutoLaunchStatus: () => ipcRenderer.invoke(channels.AUTO_LAUNCH_STATUS),
  
  // Updates
  checkForUpdates: () => ipcRenderer.send(channels.CHECK_FOR_UPDATES),
  onUpdateAvailable: (callback) => ipcRenderer.on(channels.UPDATE_AVAILABLE, callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on(channels.UPDATE_DOWNLOADED, callback),
  installUpdate: () => ipcRenderer.send(channels.INSTALL_UPDATE),
  
  // App Info
  getAppVersion: () => ipcRenderer.invoke(channels.GET_APP_VERSION),
  
  // Navigation
  navigateTo: (path) => ipcRenderer.send(channels.NAVIGATE_TO, path),
  
  // Platform detection
  platform: process.platform,
  isElectron: true,
});
