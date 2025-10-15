import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useProfile = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: characters, isLoading: charactersLoading } = useQuery({
    queryKey: ['characters', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID');
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const addCharacter = useMutation({
    mutationFn: async (character: { name: string; level?: number; vocation?: string }) => {
      if (!userId) throw new Error('No user ID');
      const { data, error } = await supabase
        .from('characters')
        .insert({ ...character, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters', userId] });
      toast({ title: 'Character added successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error adding character',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateCharacter = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: { name?: string; level?: number; vocation?: string };
    }) => {
      const { data, error } = await supabase
        .from('characters')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters', userId] });
      toast({ title: 'Character updated successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating character',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteCharacter = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('characters').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters', userId] });
      toast({ title: 'Character deleted successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting character',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const setActiveCharacter = useMutation({
    mutationFn: async (characterId: string) => {
      if (!userId) throw new Error('No user ID');
      const { data, error } = await supabase
        .from('profiles')
        .update({ active_character_id: characterId })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      toast({ title: 'Active character updated' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating active character',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: { email_notifications?: boolean; claim_reminders?: boolean }) => {
      if (!userId) throw new Error('No user ID');
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      toast({ title: 'Profile updated successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    profile,
    characters,
    isLoading: profileLoading || charactersLoading,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    setActiveCharacter,
    updateProfile,
  };
};
