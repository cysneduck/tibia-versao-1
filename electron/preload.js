/**
 * Preload Script
 * Bridge between main and renderer processes
 * Exposes safe Electron APIs to React app via contextBridge
 */

import { contextBridge, ipcRenderer } from 'electron';
import channels from './ipcChannels.js';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Notifications
  showNotification: (data) => ipcRenderer.send(channels.SHOW_NOTIFICATION, data),
  showUrgentClaim: (data) => ipcRenderer.send(channels.SHOW_URGENT_CLAIM, data),
  closeNotification: (id) => ipcRenderer.send(channels.CLOSE_NOTIFICATION, id),
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
