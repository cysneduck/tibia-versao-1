import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
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

export const useNotifications = (userId: string | undefined, desktopNotificationsEnabled: boolean = true) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasPermission, showNotification } = useDesktopNotifications();
  const electronNotifications = useElectronNotifications();
  const [urgentClaim, setUrgentClaim] = useState<Notification | null>(null);
  const isInElectron = isElectron();
  
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

  // Subscribe to real-time notification updates
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
          console.log('[useNotifications] Real-time INSERT event received at', new Date().toISOString());
          console.log('[useNotifications] Payload:', JSON.stringify(payload, null, 2));
          
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          
          const notification = payload.new as Notification;
          
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
          console.log('[useNotifications] About to show notification - isInElectron:', isInElectron);
          if (isInElectron) {
            console.log('[useNotifications] Calling electronNotifications.showNotification');
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
                // Focus window when notification is clicked
                if (notification.respawn_id) {
                  window.location.href = '/';
                }
              },
            };

            // Enhance high-priority claim_ready notifications
            if (notification.type === 'claim_ready') {
              notificationOptions.requireInteraction = true; // Stays until clicked
              notificationOptions.renotify = true; // Re-alerts if duplicate
              notificationOptions.image = '/pwa-512x512.png';
            }

              showNotification(notificationOptions);
            }
          }

          // Handle urgent claim modal and tab notifications
          if (notification.type === 'claim_ready') {
            // Blink tab title for urgent attention
            TabNotification.blink();
            
            // Show urgent modal if tab is visible
            if (document.visibilityState === 'visible') {
              setUrgentClaim(notification);
            }
          }
        }
      )
      .subscribe((status, err) => {
        console.log('[useNotifications] Subscription status:', status);
        if (err) {
          console.error('[useNotifications] Subscription error:', err);
        }
        
        if (status === 'SUBSCRIBED') {
          console.log('[useNotifications] ✅ Successfully subscribed to notifications channel');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[useNotifications] ❌ Channel error - real-time updates will not work');
        } else if (status === 'TIMED_OUT') {
          console.error('[useNotifications] ⏱️ Subscription timed out');
        } else if (status === 'CLOSED') {
          console.log('[useNotifications] Channel closed');
        }
      });

    return () => {
      console.log('[useNotifications] Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast, userId, desktopNotificationsEnabled, hasPermission, showNotification, isInElectron, electronNotifications]);

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
    urgentClaim,
    setUrgentClaim,
  };
};
