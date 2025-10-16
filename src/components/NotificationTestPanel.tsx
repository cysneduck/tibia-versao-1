import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotificationTesting, NOTIFICATION_TEMPLATES } from '@/hooks/useNotificationTesting';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

const NOTIFICATION_ICONS = {
  claim_ready: '🔥',
  claim_expiring: '⏰',
  queue_update: '📍',
  system_alert: '🔔',
} as const;

const PRIORITY_VARIANTS = {
  high: 'destructive',
  medium: 'default',
  normal: 'secondary',
} as const;

export const NotificationTestPanel = () => {
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const { sendTestNotification } = useNotificationTesting();

  const handleCardClick = (type: 'claim_ready' | 'claim_expiring' | 'queue_update' | 'system_alert') => {
    setActiveCard(type);
    sendTestNotification.mutate(
      { notificationType: type },
      {
        onSettled: () => setActiveCard(null)
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Testing</CardTitle>
        <CardDescription>
          Click any card to send a test notification to yourself
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(NOTIFICATION_TEMPLATES).map(([key, template]) => {
            const type = key as keyof typeof NOTIFICATION_TEMPLATES;
            const isLoading = activeCard === key;
            
            return (
              <button
                key={key}
                onClick={() => handleCardClick(type)}
                disabled={isLoading}
                className="relative flex flex-col items-start p-6 rounded-lg border-2 border-border bg-card hover:border-primary hover:scale-105 transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none text-left"
              >
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
                
                <div className="text-4xl mb-3">{NOTIFICATION_ICONS[type]}</div>
                
                <div className="font-semibold text-lg mb-2 line-clamp-1">
                  {template.title}
                </div>
                
                <div className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {template.message}
                </div>
                
                <Badge 
                  variant={PRIORITY_VARIANTS[template.priority as keyof typeof PRIORITY_VARIANTS]} 
                  className="mt-auto"
                >
                  {template.priority.toUpperCase()}
                </Badge>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
