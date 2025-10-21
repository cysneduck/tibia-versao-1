import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface RespawnWithClaim {
  id: string;
  code: string;
  name: string;
  city: string;
  is_favorite?: boolean;
  claim?: {
    id: string;
    user_id: string;
    character_name: string;
    expires_at: string;
    claimed_at: string;
  } | null;
}

export const useRespawns = (userId?: string) => {
  const { data: respawns, isLoading, refetch } = useQuery({
    queryKey: ['respawns', userId],
    queryFn: async () => {
      // Fetch respawns
      const { data: respawnsData, error: respawnsError } = await supabase
        .from('respawns')
        .select('*')
        .order('city', { ascending: true })
        .order('code', { ascending: true });

      if (respawnsError) throw respawnsError;

      // Fetch active claims
      const { data: claimsData, error: claimsError } = await supabase
        .from('claims')
        .select('*')
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString());

      if (claimsError) throw claimsError;

      // Fetch user favorites
      let favoritesData: any[] = [];
      if (userId) {
        const { data, error } = await supabase
          .from('favorite_respawns')
          .select('respawn_id')
          .eq('user_id', userId);
        
        if (!error && data) {
          favoritesData = data;
        }
      }

      // Join respawns with claims and favorites
      const respawnsWithClaims: RespawnWithClaim[] = respawnsData.map((respawn) => {
        const claim = claimsData.find((c) => c.respawn_id === respawn.id);
        const isFavorite = favoritesData.some(f => f.respawn_id === respawn.id);
        
        return {
          ...respawn,
          is_favorite: isFavorite,
          claim: claim
            ? {
                id: claim.id,
                user_id: claim.user_id,
                character_name: claim.character_name,
                expires_at: claim.expires_at,
                claimed_at: claim.claimed_at,
              }
            : null,
        };
      });

      return respawnsWithClaims;
    },
  });

  // Subscribe to real-time updates for claims and favorites - instant updates without refetch
  useEffect(() => {
    const channel = supabase
      .channel('respawns-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'claims',
        },
        async () => {
          await refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorite_respawns',
        },
        async () => {
          await refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return {
    respawns: respawns || [],
    isLoading,
    refetch,
  };
};
