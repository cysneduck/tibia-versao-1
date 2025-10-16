import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

interface QueueEntry {
  id: string;
  respawn_id: string;
  user_id: string;
  character_id: string;
  character_name: string;
  joined_at: string;
  notified: boolean | null;
  priority_expires_at: string | null;
  priority_given_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

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
      return data as QueueEntry[];
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
    onMutate: async (respawnId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['respawn-queue'] });
      
      // Snapshot previous value
      const previousQueue = queryClient.getQueryData(['respawn-queue']);
      
      // Optimistically remove from queue
      queryClient.setQueryData(['respawn-queue'], (old: any) => {
        if (!old) return old;
        return old.filter((entry: any) => 
          !(entry.respawn_id === respawnId && entry.user_id === userId)
        );
      });
      
      return { previousQueue };
    },
    onError: (error: Error, variables, context: any) => {
      // Rollback on error
      if (context?.previousQueue) {
        queryClient.setQueryData(['respawn-queue'], context.previousQueue);
      }
      
      toast({
        title: 'Error leaving queue',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['respawn-queue'] });
      queryClient.invalidateQueries({ queryKey: ['respawns'] });
      toast({
        title: 'Left queue successfully',
        description: 'You have been removed from the queue.',
      });
    },
  });

  // Subscribe to real-time queue updates
  useEffect(() => {
    if (!userId) return;

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
          queryClient.invalidateQueries({ queryKey: ['respawns'] });
          
          // Check if user got priority
          if (payload.eventType === 'UPDATE' && 
              payload.new.user_id === userId &&
              payload.new.priority_expires_at && 
              !payload.old.priority_expires_at) {
            
            const expiresAt = new Date(payload.new.priority_expires_at);
            const now = new Date();
            const minutesLeft = Math.floor((expiresAt.getTime() - now.getTime()) / 60000);
            
            toast({
              title: "It's your turn!",
              description: `You have ${minutesLeft} minutes to claim this respawn!`,
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
