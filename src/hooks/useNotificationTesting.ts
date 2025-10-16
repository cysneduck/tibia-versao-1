import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendTestNotificationParams {
  notificationType: 'claim_ready' | 'claim_expiring' | 'queue_update' | 'system_alert';
}

export const NOTIFICATION_TEMPLATES = {
  claim_ready: {
    title: "🔥 Sua Vez de Clamar!",
    message: "O respawn [TEST] está disponível. Você tem 5 minutos!",
    type: "claim_ready",
    priority: "high"
  },
  claim_expiring: {
    title: "⏰ Claim Expirando",
    message: "Seu claim no respawn [TEST] expira em 2 minutos!",
    type: "claim_expiring",
    priority: "medium"
  },
  queue_update: {
    title: "📍 Atualização da Fila",
    message: "Você é o próximo na fila do respawn [TEST]",
    type: "queue_update",
    priority: "normal"
  },
  system_alert: {
    title: "🔔 Alerta do Sistema",
    message: "Esta é uma notificação de teste do sistema",
    type: "system_alert",
    priority: "normal"
  }
} as const;

export const useNotificationTesting = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const sendTestNotification = useMutation({
    mutationFn: async ({ notificationType }: SendTestNotificationParams) => {
      const { data, error } = await supabase.functions.invoke('test-notification', {
        body: {
          notification_type: notificationType,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: 'Test notification sent!',
        description: 'Check your notifications panel to see the result.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error sending test notification',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    sendTestNotification,
    isLoading: sendTestNotification.isPending,
  };
};
