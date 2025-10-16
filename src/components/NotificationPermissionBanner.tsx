import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDesktopNotifications } from '@/hooks/useDesktopNotifications';

interface NotificationPermissionBannerProps {
  onPermissionGranted?: () => void;
}

export const NotificationPermissionBanner = ({ onPermissionGranted }: NotificationPermissionBannerProps) => {
  const [dismissed, setDismissed] = useState(false);
  const { canRequest, requestPermission, isSupported } = useDesktopNotifications();

  useEffect(() => {
    const hasSeenBanner = localStorage.getItem('notification-banner-dismissed');
    if (hasSeenBanner) {
      setDismissed(true);
    }
  }, []);

  const handleEnable = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      setDismissed(true);
      localStorage.setItem('notification-banner-dismissed', 'true');
      onPermissionGranted?.();
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('notification-banner-dismissed', 'true');
  };

  if (!isSupported || !canRequest || dismissed) {
    return null;
  }

  return (
    <Card className="p-4 border-primary/50 bg-primary/5 mb-6">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-full bg-primary/10">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-foreground">Enable Desktop Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Get notified when it's your turn to claim a respawn, even when the app is minimized. Never miss your turn again!
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleEnable}>
              Enable Notifications
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              Maybe Later
            </Button>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
