import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOnboarding = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: onboardingStatus, isLoading } = useQuery({
    queryKey: ['onboarding', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID');
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed, password_changed, first_login')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: characters } = useQuery({
    queryKey: ['characters', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID');
      const { data, error } = await supabase
        .from('characters')
        .select('id')
        .eq('user_id', userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const changePassword = useMutation({
    mutationFn: async ({ newPassword }: { newPassword: string }) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    },
    onError: (error: Error) => {
      toast({
        title: 'Error changing password',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const markPasswordChanged = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('No user ID');
      const { error } = await supabase
        .from('profiles')
        .update({ password_changed: true })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', userId] });
    },
  });

  const completeOnboarding = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('No user ID');
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          first_login: false 
        })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', userId] });
      toast({ 
        title: 'Bem-vindo ao Claimed System!',
        description: 'Sua conta está configurada e pronta para uso.' 
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao finalizar cadastro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    needsOnboarding: onboardingStatus?.first_login === true || onboardingStatus?.onboarding_completed === false,
    needsPasswordChange: onboardingStatus?.password_changed === false,
    hasCharacters: (characters?.length ?? 0) > 0,
    isLoading,
    changePassword,
    markPasswordChanged,
    completeOnboarding,
  };
};
