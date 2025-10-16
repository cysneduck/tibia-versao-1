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
    onMutate: async ({ respawnId, characterId }) => {
      await queryClient.cancelQueries({ queryKey: ['respawn-queue'] });
      
      const previousQueue = queryClient.getQueryData(['respawn-queue']);
      
      // Optimistically add to queue
      queryClient.setQueryData(['respawn-queue'], (old: any) => {
        if (!old) return old;
        
        // Find character name from cache
        const characters = queryClient.getQueryData(['characters', userId]) as any[];
        const character = characters?.find((c: any) => c.id === characterId);
        
        return [...old, {
          id: 'temp-' + Date.now(),
          respawn_id: respawnId,
          user_id: userId,
          character_id: characterId,
          character_name: character?.name || 'Loading...',
          joined_at: new Date().toISOString(),
          notified: false,
          priority_expires_at: null,
          priority_given_at: null,
          created_at: null,
          updated_at: null,
        }];
      });
      
      return { previousQueue };
    },
    onError: (error: Error, variables, context: any) => {
      if (context?.previousQueue) {
        queryClient.setQueryData(['respawn-queue'], context.previousQueue);
      }
      toast({
        title: 'Error joining queue',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSuccess: (data) => {
      // Background refetch
      queryClient.invalidateQueries({ queryKey: ['respawn-queue'] });
      toast({
        title: 'Joined queue successfully!',
        description: `You are position #${data.position} in the queue.`,
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
    onSuccess: async () => {
      // Immediate refetch to get next person's priority update
      await queryClient.refetchQueries({ queryKey: ['respawn-queue'] });
      toast({
        title: 'Left queue successfully',
        description: 'You have been removed from the queue.',
      });
    },
  });

  // Subscribe to all queue changes for instant updates
  useEffect(() => {
    const channel = supabase
      .channel('queue-realtime-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'respawn_queue',
        },
        async (payload) => {
          // Refetch immediately for instant updates across all users
          await queryClient.refetchQueries({ queryKey: ['respawn-queue'] });
          
          // Check if current user got priority
          if (userId && payload.eventType === 'UPDATE' && payload.new.user_id === userId) {
            if (payload.new.priority_expires_at && !payload.old.priority_expires_at) {
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast, userId]);

  // Client-side priority expiration check - runs every second for instant removal
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.setQueryData(['respawn-queue'], (old: QueueEntry[] | undefined) => {
        if (!old) return old;
        
        const now = new Date();
        const filtered = old.filter(entry => {
          // Remove entries with expired priority
          if (entry.priority_expires_at) {
            const expiresAt = new Date(entry.priority_expires_at);
            if (expiresAt <= now) {
              // Priority expired - remove from queue instantly
              return false;
            }
          }
          return true;
        });
        
        // Only update if something changed
        return filtered.length !== old.length ? filtered : old;
      });
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [queryClient]);

  return {
    queueData: queueData || [],
    isLoading,
    joinQueue,
    leaveQueue,
  };
};
