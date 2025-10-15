import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export const useQueue = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: queueData, isLoading } = useQuery({
    queryKey: ['respawn-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('respawn_queue')
        .select('*')
        .order('joined_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const joinQueue = useMutation({
    mutationFn: async ({ respawnId, characterId }: { respawnId: string; characterId: string }) => {
      const { data, error } = await supabase.rpc('join_respawn_queue', {
        p_respawn_id: respawnId,
        p_character_id: characterId,
      });

      if (error) throw error;
      
      const result = data as any;
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['respawn-queue'] });
      queryClient.invalidateQueries({ queryKey: ['respawns'] });
      toast({
        title: 'Joined queue successfully!',
        description: `You are position #${data.position} in the queue.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error joining queue',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const leaveQueue = useMutation({
    mutationFn: async (respawnId: string) => {
      const { data, error } = await supabase.rpc('leave_respawn_queue', {
        p_respawn_id: respawnId,
      });

      if (error) throw error;
      
      const result = data as any;
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['respawn-queue'] });
      queryClient.invalidateQueries({ queryKey: ['respawns'] });
      toast({
        title: 'Left queue successfully',
        description: 'You have been removed from the queue.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error leaving queue',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Subscribe to real-time queue updates
  useEffect(() => {
    const channel = supabase
      .channel('queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'respawn_queue',
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['respawn-queue'] });
          
          // Check if user was notified
          if (payload.eventType === 'UPDATE' && 
              payload.new.notified === true && 
              payload.new.user_id === userId &&
              payload.old.notified === false) {
            toast({
              title: "It's your turn!",
              description: `The respawn you were waiting for is now available. You can claim it now.`,
              duration: 10000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast, userId]);

  return {
    queueData: queueData || [],
    isLoading,
    joinQueue,
    leaveQueue,
  };
};
