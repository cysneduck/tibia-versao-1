import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export const useFavorites = (userId?: string) => {
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('favorite_respawns')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const addFavorite = useMutation({
    mutationFn: async (respawnId: string) => {
      if (!userId) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('favorite_respawns')
        .insert({ user_id: userId, respawn_id: respawnId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
      queryClient.invalidateQueries({ queryKey: ['respawns', userId] });
      toast({
        title: "Added to favorites",
        description: "Respawn marked as favorite",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add favorite",
        variant: "destructive",
      });
    },
  });

  const removeFavorite = useMutation({
    mutationFn: async (respawnId: string) => {
      if (!userId) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('favorite_respawns')
        .delete()
        .eq('user_id', userId)
        .eq('respawn_id', respawnId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
      queryClient.invalidateQueries({ queryKey: ['respawns', userId] });
      toast({
        title: "Removed from favorites",
        description: "Respawn unmarked as favorite",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove favorite",
        variant: "destructive",
      });
    },
  });

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('favorite-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorite_respawns',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
          queryClient.invalidateQueries({ queryKey: ['respawns', userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  const isFavorite = (respawnId: string) => {
    return favorites?.some(f => f.respawn_id === respawnId) ?? false;
  };

  return {
    favorites: favorites || [],
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
  };
};
