import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useClaims = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: userClaims, isLoading } = useQuery({
    queryKey: ['user-claims', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID');
      const { data, error } = await supabase
        .from('claims')
        .select('*, respawns(*)')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const claimRespawn = useMutation({
    mutationFn: async ({ respawnId, characterId }: { respawnId: string; characterId: string }) => {
      const { data, error } = await supabase.rpc('claim_respawn', {
        p_respawn_id: respawnId,
        p_character_id: characterId,
      });

      if (error) throw error;
      
      const result = data as any;
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['respawns'] });
      queryClient.invalidateQueries({ queryKey: ['user-claims', userId] });
      toast({
        title: 'Respawn claimed successfully!',
        description: 'The respawn has been added to your claims.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error claiming respawn',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const releaseClaim = useMutation({
    mutationFn: async (claimId: string) => {
      const { data, error } = await supabase.rpc('release_claim', {
        p_claim_id: claimId,
      });

      if (error) throw error;
      
      const result = data as any;
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['respawns'] });
      queryClient.invalidateQueries({ queryKey: ['user-claims', userId] });
      toast({
        title: 'Claim released successfully',
        description: 'The respawn is now available for others to claim.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error releasing claim',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    userClaims,
    isLoading,
    claimRespawn,
    releaseClaim,
  };
};
