import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useDesktopNotifications, NotificationPriority } from '@/hooks/useDesktopNotifications';
import { NotificationSound } from '@/utils/notificationSounds';
import { TabNotification } from '@/utils/tabNotification';
import { useElectronNotifications } from '@/hooks/useElectronNotifications';
import { isElectron } from '@/utils/isElectron';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  respawn_id: string | null;
  is_read: boolean;
  created_at: string;
  expires_at: string | null;
}

const POLL_INTERVAL = 5000; // 5 seconds
const DUPLICATE_WINDOW = 1000; // 1 second - prevent duplicate processing

// Module-level deduplication tracker to persist across component re-mounts
const recentNotifications = new Map<string, number>();

export const useNotifications = (userId: string | undefined, desktopNotificationsEnabled: boolean = true) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasPermission, showNotification } = useDesktopNotifications();
  const electronNotifications = useElectronNotifications();
  const [urgentClaim, setUrgentClaim] = useState<Notification | null>(null);
  const isInElectron = isElectron();
  
  // Track which notifications have already played sound
  const soundedNotifications = useRef(new Set<string>());
  const lastCheckedTimestamp = useRef(new Date().toISOString());
  
  console.log('[useNotifications] Hook initialized - isInElectron:', isInElectron);
  console.log('[useNotifications] window.electronAPI:', typeof window !== 'undefined' ? !!(window as any).electronAPI : 'undefined');

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!userId,
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Notifications cleared",
        description: "All notifications have been marked as read",
      });
    },
    onError: (error) => {
      console.error('[markAllAsRead] Error:', error);
      toast({
        title: "Error clearing notifications",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Centralized notification handler for both real-time and polling
  const handleNewNotification = useCallback((notification: Notification, source: 'realtime' | 'polling') => {
    console.log(`[${source}] Processing notification:`, notification.id, notification.type);
    
    // Check for duplicate processing within time window
    const now = Date.now();
    const lastSeen = recentNotifications.get(notification.id);
    if (lastSeen && (now - lastSeen) < DUPLICATE_WINDOW) {
      console.log(`[${source}] ⚠️ Skipping - duplicate detected within ${DUPLICATE_WINDOW}ms`);
      return;
    }
    recentNotifications.set(notification.id, now);
    
    // Clean up old entries (older than 30 seconds)
    for (const [id, timestamp] of recentNotifications.entries()) {
      if (now - timestamp > 30000) {
        recentNotifications.delete(id);
      }
    }
    
    // Only play sound if we haven't already
    if (soundedNotifications.current.has(notification.id)) {
      console.log(`[${source}] Skipping sound - already played for`, notification.id);
      return;
    }
    soundedNotifications.current.add(notification.id);
    
    // Determine priority based on notification type
    let priority: NotificationPriority = 'normal';
    if (notification.type === 'claim_ready') {
      priority = 'high';
    } else if (notification.type === 'claim_expiring') {
      priority = 'medium';
    }
    
    // Show in-app toast
    toast({
      title: notification.title,
      description: notification.message,
      duration: notification.type === 'claim_ready' ? 10000 : 5000,
    });
    
    // Use Electron notifications if available, otherwise use browser notifications
    console.log(`[${source}] Playing sound - priority:`, priority, 'isInElectron:', isInElectron);
    if (isInElectron) {
      console.log(`[${source}] Calling electronNotifications.showNotification`);
      // Electron main process will handle sound playback
      electronNotifications.showNotification(notification);
    } else {
      // Play notification sound for browser
      NotificationSound.play(priority);
      
      if (desktopNotificationsEnabled && hasPermission) {
        const notificationOptions: any = {
          title: notification.title,
          body: notification.message,
          priority,
          tag: `respawn-${notification.respawn_id}`,
          onClick: () => {
            if (notification.respawn_id) {
              window.location.href = '/';
            }
          },
        };

        // Enhance high-priority claim_ready notifications
        if (notification.type === 'claim_ready') {
          notificationOptions.requireInteraction = true;
          notificationOptions.renotify = true;
          notificationOptions.image = '/pwa-512x512.png';
        }

        showNotification(notificationOptions);
      }
    }

    // Handle urgent claim modal and tab notifications
    if (notification.type === 'claim_ready') {
      TabNotification.blink();
      
      if (document.visibilityState === 'visible') {
        setUrgentClaim(notification);
      }
    }
  }, [toast, isInElectron, electronNotifications, desktopNotificationsEnabled, hasPermission, showNotification]);

  // Real-time subscription (best effort - polling is the reliable backup)
  useEffect(() => {
    if (!userId) return;

    console.log('[useNotifications] Setting up real-time subscription for user:', userId);

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('[realtime] INSERT event received at', new Date().toISOString());
          
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          
          const notification = payload.new as Notification;
          handleNewNotification(notification, 'realtime');
        }
      )
      .subscribe((status, err) => {
        console.log('[realtime] Subscription status:', status);
        if (err) {
          console.error('[realtime] Subscription error:', err);
        }
        
        if (status === 'SUBSCRIBED') {
          console.log('[realtime] ✅ Successfully subscribed to notifications channel');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[realtime] ❌ Channel error - polling will handle notifications');
        } else if (status === 'TIMED_OUT') {
          console.error('[realtime] ⏱️ Subscription timed out');
        } else if (status === 'CLOSED') {
          console.log('[realtime] Channel closed');
        }
      });

    return () => {
      console.log('[realtime] Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId, handleNewNotification]);

  // Polling mechanism (reliable backup for real-time)
  useEffect(() => {
    if (!userId) return;

    console.log('[polling] Starting notification polling with interval:', POLL_INTERVAL);

    const pollInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .gt('created_at', lastCheckedTimestamp.current)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('[polling] Error:', error);
          return;
        }

        if (data && data.length > 0) {
          console.log(`[polling] Found ${data.length} new notification(s)`);
          
          data.forEach((notification) => {
            handleNewNotification(notification as Notification, 'polling');
          });
          
          // Update last checked timestamp
          lastCheckedTimestamp.current = data[data.length - 1].created_at;
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      } catch (error) {
        console.error('[polling] Exception:', error);
      }
    }, POLL_INTERVAL);

    return () => {
      console.log('[polling] Cleaning up polling interval');
      clearInterval(pollInterval);
    };
  }, [userId, queryClient, handleNewNotification]);

  // Update tab badge with unread count (and Electron tray badge)
  useEffect(() => {
    const unread = notifications?.filter(n => !n.is_read).length || 0;
    
    if (isInElectron) {
      electronNotifications.updateBadge(unread);
    } else {
      TabNotification.setUnread(unread);
    }

    return () => {
      if (!isInElectron) {
        TabNotification.reset();
      }
    };
  }, [notifications, isInElectron, electronNotifications]);

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  return {
    notifications: notifications || [],
    unreadCount,
    isLoading,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    urgentClaim,
    setUrgentClaim,
  };
};
