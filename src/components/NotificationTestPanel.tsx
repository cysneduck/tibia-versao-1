import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useNotificationTesting, NOTIFICATION_TEMPLATES } from '@/hooks/useNotificationTesting';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Send, Zap, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NotificationTestPanelProps {
  users?: Array<{ id: string; email: string }>;
}

export const NotificationTestPanel = ({ users = [] }: NotificationTestPanelProps) => {
  const { user } = useAuth();
  const { sendTestNotification, testAllChannels, isLoading } = useNotificationTesting();
  const [notificationType, setNotificationType] = useState<'claim_ready' | 'claim_expiring' | 'queue_update' | 'system_alert' | 'custom'>('claim_ready');
  const [targetUserId, setTargetUserId] = useState<string>('myself');
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  const handleSendTest = () => {
    sendTestNotification.mutate({
      targetUserId: targetUserId === 'myself' ? user?.id : targetUserId,
      notificationType,
      customTitle: notificationType === 'custom' ? customTitle : undefined,
      customMessage: notificationType === 'custom' ? customMessage : undefined,
    });
  };

  const handleTestAllChannels = async () => {
    await testAllChannels(targetUserId === 'myself' ? user?.id : targetUserId);
  };

  const currentTemplate = notificationType !== 'custom' ? NOTIFICATION_TEMPLATES[notificationType] : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Testing
            </CardTitle>
            <CardDescription>
              Test the notification system with different types and channels
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Type Selector */}
        <div className="space-y-2">
          <Label>Notification Type</Label>
          <Select value={notificationType} onValueChange={(value: any) => setNotificationType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="claim_ready">
                <div className="flex items-center gap-2">
                  🔥 Claim Ready <Badge variant="destructive" className="ml-2">High Priority</Badge>
                </div>
              </SelectItem>
              <SelectItem value="claim_expiring">
                <div className="flex items-center gap-2">
                  ⏰ Claim Expiring <Badge variant="secondary" className="ml-2">Medium</Badge>
                </div>
              </SelectItem>
              <SelectItem value="queue_update">📍 Queue Update</SelectItem>
              <SelectItem value="system_alert">🔔 System Alert</SelectItem>
              <SelectItem value="custom">✏️ Custom Message</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Target User Selector */}
        <div className="space-y-2">
          <Label>Target User</Label>
          <Select value={targetUserId} onValueChange={setTargetUserId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="myself">Myself</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Message Fields */}
        {notificationType === 'custom' && (
          <>
            <div className="space-y-2">
              <Label>Custom Title</Label>
              <Input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Enter notification title"
              />
            </div>
            <div className="space-y-2">
              <Label>Custom Message</Label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter notification message"
                rows={3}
              />
            </div>
          </>
        )}

        {/* Preview */}
        {currentTemplate && (
          <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={currentTemplate.priority === 'high' ? 'destructive' : 'secondary'}>
                {currentTemplate.priority.toUpperCase()}
              </Badge>
              <span className="text-sm font-medium">Preview</span>
            </div>
            <div className="space-y-1">
              <p className="font-semibold">{currentTemplate.title}</p>
              <p className="text-sm text-muted-foreground">{currentTemplate.message}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={handleSendTest} 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Test Notification
              </>
            )}
          </Button>
          <Button 
            onClick={handleTestAllChannels} 
            disabled={isLoading}
            variant="outline"
          >
            <Zap className="mr-2 h-4 w-4" />
            Test All Types
          </Button>
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Test notifications will trigger all channels: toast, desktop, sound, and modal</p>
          <p>• "Test All Types" will send 4 notifications sequentially with 2-second delays</p>
          <p>• Make sure desktop notifications are enabled in your browser</p>
        </div>
      </CardContent>
    </Card>
  );
};
