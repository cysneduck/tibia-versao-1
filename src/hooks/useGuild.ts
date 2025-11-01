import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Guild {
  id: string;
  name: string;
  world: string;
  display_name: string;
  subtitle: string | null;
  created_at: string;
  updated_at: string;
}

export const useGuild = (userId: string | undefined) => {
  const { data: guild, isLoading } = useQuery({
    queryKey: ['guild', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID');
      
      // Get user's guild_id from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('guild_id')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      if (!profile?.guild_id) throw new Error('User not assigned to guild');
      
      // Get guild details
      const { data: guildData, error: guildError } = await supabase
        .from('guilds')
        .select('*')
        .eq('id', profile.guild_id)
        .single();
      
      if (guildError) throw guildError;
      return guildData as Guild;
    },
    enabled: !!userId,
  });

  return { guild, isLoading };
};
