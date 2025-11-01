import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Guild } from './useGuild';

export const useGuilds = () => {
  const queryClient = useQueryClient();

  const { data: guilds, isLoading } = useQuery({
    queryKey: ['guilds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guilds')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Guild[];
    },
  });

  const createGuild = useMutation({
    mutationFn: async ({ 
      name, 
      world, 
      display_name, 
      subtitle 
    }: {
      name: string;
      world: string;
      display_name: string;
      subtitle?: string;
    }) => {
      const { error } = await supabase
        .from('guilds')
        .insert([{ name, world, display_name, subtitle }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guilds'] });
      toast.success('Guild created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create guild: ${error.message}`);
    },
  });

  const updateGuild = useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: {
      id: string;
      updates: Partial<Guild>;
    }) => {
      const { error } = await supabase
        .from('guilds')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guilds'] });
      toast.success('Guild updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update guild: ${error.message}`);
    },
  });

  return { 
    guilds, 
    isLoading, 
    createGuild, 
    updateGuild 
  };
};
