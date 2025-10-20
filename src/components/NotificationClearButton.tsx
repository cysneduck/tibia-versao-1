/**
 * Notification Clear Button Component
 * Displays a "Clear All Notifications" button in Electron that dismisses all toast notifications
 */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { isElectron } from '@/utils/isElectron';
import { electronBridge } from '@/utils/electronBridge';

interface NotificationClearButtonProps {
  hasNotifications?: boolean;
}

export const NotificationClearButton = ({ hasNotifications = false }: NotificationClearButtonProps) => {
  const [showButton, setShowButton] = useState(false);
  
  useEffect(() => {
    // Only show in Electron when there are notifications
    setShowButton(isElectron() && hasNotifications);
  }, [hasNotifications]);

  if (!showButton) return null;

  const handleClearAll = () => {
    electronBridge.clearAllNotifications();
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleClearAll}
        className="shadow-lg"
      >
        <X className="w-4 h-4 mr-2" />
        Limpar Notificações
      </Button>
    </div>
  );
};
