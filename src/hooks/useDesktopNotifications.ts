import { useEffect, useState } from 'react';

export type NotificationPriority = 'high' | 'medium' | 'normal';

interface DesktopNotificationOptions {
  title: string;
  body: string;
  priority?: NotificationPriority;
  tag?: string;
  onClick?: () => void;
}

export const useDesktopNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (typeof Notification === 'undefined') {
      return 'denied';
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const showNotification = ({
    title,
    body,
    priority = 'normal',
    tag = 'respawn-notification',
    onClick,
  }: DesktopNotificationOptions) => {
    if (typeof Notification === 'undefined' || permission !== 'granted') {
      return null;
    }

    const options: NotificationOptions = {
      body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag,
      requireInteraction: priority === 'high',
      silent: false,
    };

    const notification = new Notification(title, options);

    notification.onclick = () => {
      window.focus();
      onClick?.();
      notification.close();
    };

    // Auto-close based on priority
    if (priority !== 'high') {
      const timeout = priority === 'medium' ? 10000 : 5000;
      setTimeout(() => notification.close(), timeout);
    }

    return notification;
  };

  const isSupported = typeof Notification !== 'undefined';
  const hasPermission = permission === 'granted';
  const canRequest = permission === 'default';
  const isDenied = permission === 'denied';

  return {
    permission,
    isSupported,
    hasPermission,
    canRequest,
    isDenied,
    requestPermission,
    showNotification,
  };
};
