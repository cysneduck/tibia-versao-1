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
      return { ...result, respawnId, characterId };
    },
    onMutate: async ({ respawnId, characterId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['respawn-queue'] });
      await queryClient.cancelQueries({ queryKey: ['respawns'] });
      await queryClient.cancelQueries({ queryKey: ['user-claims', userId] });
      
      // Snapshot previous values
      const previousQueue = queryClient.getQueryData(['respawn-queue']);
      const previousRespawns = queryClient.getQueryData(['respawns']);
      const previousClaims = queryClient.getQueryData(['user-claims', userId]);
      
      // Get character name for optimistic update
      const characters = queryClient.getQueryData(['characters', userId]) as any[];
      const character = characters?.find((c: any) => c.id === characterId);
      
      // Optimistically update queue (remove user's entry)
      queryClient.setQueryData(['respawn-queue'], (old: any) => {
        if (!old) return old;
        return old.filter((entry: any) => 
          !(entry.respawn_id === respawnId && entry.user_id === userId)
        );
      });
      
      // Optimistically update respawns (add claim)
      queryClient.setQueryData(['respawns'], (old: any) => {
        if (!old) return old;
        return old.map((respawn: any) => {
          if (respawn.id === respawnId) {
            return {
              ...respawn,
              claim: {
                id: 'temp-' + Date.now(),
                user_id: userId,
                character_name: character?.name || 'Your Character',
                expires_at: new Date(Date.now() + 75 * 60 * 1000).toISOString(), // 1h 15min
                claimed_at: new Date().toISOString(),
              },
            };
          }
          return respawn;
        });
      });
      
      // Return context for rollback
      return { previousQueue, previousRespawns, previousClaims };
    },
    onError: (error: Error, variables, context: any) => {
      // Rollback on error
      if (context?.previousQueue) {
        queryClient.setQueryData(['respawn-queue'], context.previousQueue);
      }
      if (context?.previousRespawns) {
        queryClient.setQueryData(['respawns'], context.previousRespawns);
      }
      if (context?.previousClaims) {
        queryClient.setQueryData(['user-claims', userId], context.previousClaims);
      }
      
      toast({
        title: 'Error claiming respawn',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSuccess: async () => {
      // Refetch immediately to reconcile with server state
      await queryClient.refetchQueries({ queryKey: ['respawns'] });
      await queryClient.refetchQueries({ queryKey: ['user-claims', userId] });
      await queryClient.refetchQueries({ queryKey: ['respawn-queue'] });
      
      toast({
        title: 'Respawn claimed successfully!',
        description: 'The respawn has been added to your claims.',
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
    onMutate: async (claimId) => {
      // Cancel refetches
      await queryClient.cancelQueries({ queryKey: ['respawns'] });
      await queryClient.cancelQueries({ queryKey: ['user-claims', userId] });
      await queryClient.cancelQueries({ queryKey: ['respawn-queue'] });
      
      // Snapshot previous state
      const previousRespawns = queryClient.getQueryData(['respawns']);
      const previousClaims = queryClient.getQueryData(['user-claims', userId]);
      const previousQueue = queryClient.getQueryData(['respawn-queue']);
      
      // Optimistically remove claim from respawns
      queryClient.setQueryData(['respawns'], (old: any) => {
        if (!old) return old;
        return old.map((respawn: any) => {
          if (respawn.claim?.id === claimId) {
            return { ...respawn, claim: null };
          }
          return respawn;
        });
      });
      
      // Optimistically remove from user claims
      queryClient.setQueryData(['user-claims', userId], (old: any) => {
        if (!old) return old;
        return old.filter((claim: any) => claim.id !== claimId);
      });
      
      return { previousRespawns, previousClaims, previousQueue };
    },
    onError: (error: Error, variables, context: any) => {
      // Rollback on error
      if (context?.previousRespawns) {
        queryClient.setQueryData(['respawns'], context.previousRespawns);
      }
      if (context?.previousClaims) {
        queryClient.setQueryData(['user-claims', userId], context.previousClaims);
      }
      if (context?.previousQueue) {
        queryClient.setQueryData(['respawn-queue'], context.previousQueue);
      }
      
      toast({
        title: 'Error releasing claim',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSuccess: async () => {
      // Immediate refetch to reconcile with server (includes next person getting priority)
      await queryClient.refetchQueries({ queryKey: ['respawns'] });
      await queryClient.refetchQueries({ queryKey: ['user-claims', userId] });
      await queryClient.refetchQueries({ queryKey: ['respawn-queue'] });
      
      toast({
        title: 'Claim released successfully',
        description: 'The respawn is now available for others to claim.',
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
