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

    // Customize notification messages based on type
    let customTitle = title;
    let customMessage = message;
    
    if (type === 'claim_ready') {
      customTitle = 'É Sua Vez!';
      customMessage = 'Reivindique seu respawn agora, você tem 5 minutos de prioridade!';
    } else if (type === 'claim_expiring') {
      customTitle = 'Tempo Acabando!';
      customMessage = 'Seu tempo está quase acabando no respawn!';
    } else if (type === 'priority_lost') {
      customTitle = 'Prioridade Perdida';
      // Keep the original message for priority_lost as it contains respawn name
    }

    // Determine priority
    let priority: 'high' | 'medium' | 'normal' = 'normal';
    if (type === 'claim_ready') {
      priority = 'high';
    } else if (type === 'claim_expiring') {
      priority = 'medium';
    }
    console.log('[useElectronNotifications] Calculated priority:', priority);

    // ALL notifications now use the toast-style notification
    console.log('[useElectronNotifications] Calling electronBridge.showNotification...');
    
    // Show toast notification - sound will be played by main process
    electronBridge.showNotification({
      id,
      title: customTitle,
      message: customMessage,
      type,
      respawnId: respawn_id || undefined,
      duration: priority === 'high' ? 10000 : 5000,
    });
    console.log('[useElectronNotifications] ✅ showNotification called successfully');

    // Flash taskbar for high priority notifications
    if (priority === 'high') {
      electronBridge.flashFrame(true);
      console.log('[useElectronNotifications] ✅ flashFrame called for high priority');
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
