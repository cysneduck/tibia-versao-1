import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface RespawnWithClaim {
  id: string;
  code: string;
  name: string;
  city: string;
  claim?: {
    id: string;
    user_id: string;
    character_name: string;
    expires_at: string;
    claimed_at: string;
  } | null;
}

export const useRespawns = () => {
  const { data: respawns, isLoading, refetch } = useQuery({
    queryKey: ['respawns'],
    queryFn: async () => {
      // Fetch respawns
      const { data: respawnsData, error: respawnsError } = await supabase
        .from('respawns')
        .select('*')
        .order('city', { ascending: true })
        .order('name', { ascending: true });

      if (respawnsError) throw respawnsError;

      // Fetch active claims
      const { data: claimsData, error: claimsError } = await supabase
        .from('claims')
        .select('*')
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString());

      if (claimsError) throw claimsError;

      // Join respawns with claims
      const respawnsWithClaims: RespawnWithClaim[] = respawnsData.map((respawn) => {
        const claim = claimsData.find((c) => c.respawn_id === respawn.id);
        return {
          ...respawn,
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

  // Subscribe to real-time updates for claims
  useEffect(() => {
    const channel = supabase
      .channel('claims-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'claims',
        },
        () => {
          // Refetch respawns when claims change
          refetch();
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
