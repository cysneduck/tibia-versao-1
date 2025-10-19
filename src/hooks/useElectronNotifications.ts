/**
 * Electron Notifications Hook
 * Handles notifications via Electron IPC instead of browser notifications
 */

import { useEffect, useCallback } from 'react';
import { electronBridge } from '@/utils/electronBridge';
import { isElectron } from '@/utils/isElectron';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  respawn_id: string | null;
  priority?: 'high' | 'medium' | 'normal';
}

export const useElectronNotifications = () => {
  const navigate = useNavigate();

  // Show notification via Electron
  const showNotification = useCallback((notification: Notification) => {
    console.log('[useElectronNotifications] ========================================');
    console.log('[useElectronNotifications] showNotification called at:', new Date().toISOString());
    console.log('[useElectronNotifications] Notification object:', JSON.stringify(notification, null, 2));
    console.log('[useElectronNotifications] isElectron():', isElectron());
    console.log('[useElectronNotifications] electronBridge.isAvailable():', electronBridge.isAvailable());
    
    if (!isElectron()) {
      console.log('[useElectronNotifications] ❌ Not in Electron, skipping');
      console.log('[useElectronNotifications] ========================================');
      return;
    }

    const { id, title, message, type, respawn_id } = notification;
    console.log('[useElectronNotifications] Extracted fields:');
    console.log('[useElectronNotifications] - id:', id);
    console.log('[useElectronNotifications] - title:', title);
    console.log('[useElectronNotifications] - message:', message);
    console.log('[useElectronNotifications] - type:', type);
    console.log('[useElectronNotifications] - respawn_id:', respawn_id);

    // Determine priority
    let priority: 'high' | 'medium' | 'normal' = 'normal';
    if (type === 'claim_ready') {
      priority = 'high';
    } else if (type === 'claim_expiring') {
      priority = 'medium';
    }
    console.log('[useElectronNotifications] Calculated priority:', priority);

    // Show urgent claim window for high priority
    if (priority === 'high' && respawn_id) {
      console.log('[useElectronNotifications] ✅ Conditions met for urgent claim window:');
      console.log('[useElectronNotifications] - priority === "high":', priority === 'high');
      console.log('[useElectronNotifications] - respawn_id exists:', !!respawn_id);
      console.log('[useElectronNotifications] Calling electronBridge.showUrgentClaim...');
      
      // Calculate expiration (5 minutes from now)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      
      electronBridge.showUrgentClaim({
        claimCode: respawn_id.substring(0, 8),
        claimName: title,
        expiresAt,
      });
      console.log('[useElectronNotifications] ✅ showUrgentClaim called successfully');

      // Flash taskbar - sound will be played by main process
      electronBridge.flashFrame(true);
      console.log('[useElectronNotifications] ✅ flashFrame called');
    } else {
      console.log('[useElectronNotifications] ⚠️ Using regular notification (not urgent):');
      console.log('[useElectronNotifications] - priority === "high":', priority === 'high');
      console.log('[useElectronNotifications] - respawn_id exists:', !!respawn_id);
      console.log('[useElectronNotifications] Calling electronBridge.showNotification...');
      
      // Show regular notification - sound will be played by main process
      electronBridge.showNotification({
        id,
        title,
        message,
        type,
        respawnId: respawn_id || undefined,
        duration: priority === 'high' ? 10000 : 5000,
      });
      console.log('[useElectronNotifications] ✅ showNotification called successfully');
    }
    console.log('[useElectronNotifications] ========================================');
  }, []);

  // Update tray badge
  const updateBadge = useCallback((count: number) => {
    if (!isElectron()) return;
    electronBridge.updateTrayBadge(count);
  }, []);

  // Handle notification clicks
  useEffect(() => {
    if (!isElectron()) return;

    electronBridge.onNotificationClicked(({ respawnId }) => {
      if (respawnId) {
        navigate('/');
      }
      electronBridge.focusWindow();
    });
  }, [navigate]);

  return {
    showNotification,
    updateBadge,
    isElectron: isElectron(),
  };
};
