/**
 * Electron Notifications Hook
 * Handles notifications via Electron IPC instead of browser notifications
 */

import { useEffect, useCallback } from 'react';
import { electronBridge } from '@/utils/electronBridge';
import { electronSounds } from '@/utils/electronSounds';
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
    if (!isElectron()) return;

    const { id, title, message, type, respawn_id } = notification;

    // Determine priority
    let priority: 'high' | 'medium' | 'normal' = 'normal';
    if (type === 'claim_ready') {
      priority = 'high';
    } else if (type === 'claim_expiring') {
      priority = 'medium';
    }

    // Show urgent claim window for high priority
    if (priority === 'high' && respawn_id) {
      // Calculate expiration (5 minutes from now)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      
      electronBridge.showUrgentClaim({
        claimCode: respawn_id.substring(0, 8),
        claimName: title,
        expiresAt,
      });

      // Flash taskbar and play urgent sound
      electronBridge.flashFrame(true);
      electronSounds.playUrgentSound();
    } else {
      // Show regular notification
      electronBridge.showNotification({
        id,
        title,
        message,
        type,
        respawnId: respawn_id || undefined,
        duration: priority === 'high' ? 10000 : 5000,
      });

      // Play appropriate sound
      if (priority === 'medium') {
        electronSounds.playExpiringSound();
      } else {
        electronSounds.playQueueSound();
      }
    }
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
