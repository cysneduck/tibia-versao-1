/**
 * Electron IPC Bridge
 * Type-safe wrapper for Electron IPC communication
 */

import { getElectronAPI, hasElectronAPI } from './isElectron';

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: string;
  respawnId?: string;
  duration?: number;
}

interface UrgentClaimData {
  claimCode: string;
  claimName: string;
  expiresAt: string;
}

class ElectronBridge {
  private api: any;

  constructor() {
    this.api = getElectronAPI();
  }

  isAvailable(): boolean {
    return hasElectronAPI() && this.api !== null;
  }

  // Notifications
  showNotification(data: NotificationData): void {
    console.log('[electronBridge] ========================================');
    console.log('[electronBridge] showNotification called at:', new Date().toISOString());
    console.log('[electronBridge] Data:', JSON.stringify(data, null, 2));
    console.log('[electronBridge] isAvailable:', this.isAvailable());
    
    if (!this.isAvailable()) {
      console.log('[electronBridge] ❌ API not available');
      console.log('[electronBridge] ========================================');
      return;
    }
    
    console.log('[electronBridge] ✅ Sending SHOW_NOTIFICATION IPC...');
    this.api.showNotification(data);
    console.log('[electronBridge] ✅ IPC sent successfully');
    console.log('[electronBridge] ========================================');
  }

  showUrgentClaim(data: UrgentClaimData): void {
    console.log('[electronBridge] ========================================');
    console.log('[electronBridge] showUrgentClaim called at:', new Date().toISOString());
    console.log('[electronBridge] Data:', JSON.stringify(data, null, 2));
    console.log('[electronBridge] isAvailable:', this.isAvailable());
    
    if (!this.isAvailable()) {
      console.log('[electronBridge] ❌ API not available');
      console.log('[electronBridge] ========================================');
      return;
    }
    
    console.log('[electronBridge] ✅ Sending SHOW_URGENT_CLAIM IPC...');
    this.api.showUrgentClaim(data);
    console.log('[electronBridge] ✅ IPC sent successfully');
    console.log('[electronBridge] ========================================');
  }

  closeNotification(id: string): void {
    if (!this.isAvailable()) return;
    this.api.closeNotification(id);
  }

  onNotificationClicked(callback: (data: any) => void): void {
    if (!this.isAvailable()) return;
    this.api.onNotificationClicked((_: any, data: any) => callback(data));
  }

  // Sounds
  playSound(soundType: string, priority: 'high' | 'medium' | 'normal' = 'normal'): void {
    console.log('[electronBridge] playSound called:', soundType, priority);
    console.log('[electronBridge] isAvailable:', this.isAvailable());
    console.log('[electronBridge] api:', this.api);
    if (!this.isAvailable()) {
      console.log('[electronBridge] API not available, returning');
      return;
    }
    console.log('[electronBridge] Calling api.playSound');
    this.api.playSound(soundType, priority);
    console.log('[electronBridge] api.playSound called');
  }

  stopSound(): void {
    if (!this.isAvailable()) return;
    this.api.stopSound();
  }

  setSoundVolume(volume: number): void {
    if (!this.isAvailable()) return;
    this.api.setSoundVolume(volume);
  }

  // Window Management
  minimizeWindow(): void {
    if (!this.isAvailable()) return;
    this.api.minimizeWindow();
  }

  maximizeWindow(): void {
    if (!this.isAvailable()) return;
    this.api.maximizeWindow();
  }

  closeWindow(): void {
    if (!this.isAvailable()) return;
    this.api.closeWindow();
  }

  restoreWindow(): void {
    if (!this.isAvailable()) return;
    this.api.restoreWindow();
  }

  flashFrame(flag: boolean = true): void {
    if (!this.isAvailable()) return;
    this.api.flashFrame(flag);
  }

  focusWindow(): void {
    if (!this.isAvailable()) return;
    this.api.focusWindow();
  }

  // System Tray
  updateTrayBadge(count: number): void {
    if (!this.isAvailable()) return;
    this.api.updateTrayBadge(count);
  }

  updateTrayTitle(title: string): void {
    if (!this.isAvailable()) return;
    this.api.updateTrayTitle(title);
  }

  onTrayClicked(callback: () => void): void {
    if (!this.isAvailable()) return;
    this.api.onTrayClicked(callback);
  }

  // Settings
  async getSettings(): Promise<any> {
    if (!this.isAvailable()) return {};
    return this.api.getSettings();
  }

  setSettings(settings: any): void {
    if (!this.isAvailable()) return;
    this.api.setSettings(settings);
  }

  async enableAutoLaunch(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    return this.api.enableAutoLaunch();
  }

  async disableAutoLaunch(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    return this.api.disableAutoLaunch();
  }

  async getAutoLaunchStatus(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    return this.api.getAutoLaunchStatus();
  }

  // Updates
  checkForUpdates(): void {
    if (!this.isAvailable()) return;
    this.api.checkForUpdates();
  }

  onUpdateAvailable(callback: (info: any) => void): void {
    if (!this.isAvailable()) return;
    this.api.onUpdateAvailable((_: any, info: any) => callback(info));
  }

  onUpdateDownloaded(callback: (info: any) => void): void {
    if (!this.isAvailable()) return;
    this.api.onUpdateDownloaded((_: any, info: any) => callback(info));
  }

  installUpdate(): void {
    if (!this.isAvailable()) return;
    this.api.installUpdate();
  }

  // App Info
  async getAppVersion(): Promise<string> {
    if (!this.isAvailable()) return 'web';
    return this.api.getAppVersion();
  }

  // Navigation
  navigateTo(path: string): void {
    if (!this.isAvailable()) return;
    this.api.navigateTo(path);
  }

  // Platform
  getPlatform(): string {
    if (!this.isAvailable()) return 'web';
    return this.api.platform;
  }
}

// Export singleton instance
export const electronBridge = new ElectronBridge();
