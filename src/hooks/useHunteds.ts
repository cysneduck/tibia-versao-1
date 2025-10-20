import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export interface HuntedCharacter {
  id: string;
  character_name: string;
  added_by: string | null;
  added_by_email: string | null;
  reason: string | null;
  created_at: string;
  updated_at: string;
}

export const useHunteds = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all hunted characters
  const { data: hunteds, isLoading } = useQuery({
    queryKey: ['hunted-characters'],
    queryFn: async () => {
      const { data: huntedData, error: huntedError } = await supabase
        .from('hunted_characters')
        .select('*')
        .order('created_at', { ascending: false });

      if (huntedError) throw huntedError;

      // Get unique admin IDs
      const adminIds = [...new Set(huntedData?.map(h => h.added_by).filter(Boolean))] as string[];
      
      // Fetch admin emails
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', adminIds);

      // Map profiles to a lookup object
      const profileMap = new Map(profiles?.map(p => [p.id, p.email]) || []);

      // Combine data
      return huntedData.map(item => ({
        ...item,
        added_by_email: item.added_by ? profileMap.get(item.added_by) || null : null
      })) as HuntedCharacter[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('hunted-characters-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hunted_characters'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['hunted-characters'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Add hunted character (admin only)
  const addHunted = useMutation({
    mutationFn: async ({ character_name, reason }: { character_name: string; reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('hunted_characters')
        .insert({
          character_name,
          reason: reason || null,
          added_by: user?.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hunted-characters'] });
      toast({
        title: "Success",
        description: "Character added to hunted list",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add hunted character",
        variant: "destructive",
      });
    },
  });

  // Remove hunted character (admin only)
  const removeHunted = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hunted_characters')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hunted-characters'] });
      toast({
        title: "Success",
        description: "Character removed from hunted list",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove hunted character",
        variant: "destructive",
      });
    },
  });

  return {
    hunteds,
    isLoading,
    addHunted,
    removeHunted,
  };
};