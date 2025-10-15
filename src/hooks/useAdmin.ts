import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAdmin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;

      // Fetch roles separately
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;

      // Map roles to users
      return profilesData.map((user) => {
        const userRole = rolesData.find((r) => r.user_id === user.id);
        return {
          ...user,
          role: userRole?.role || 'neutro',
        };
      });
    },
  });

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('system_settings').select('*');
      if (error) throw error;
      return data.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, string>);
    },
  });

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      // Delete existing role
      await supabase.from('user_roles').delete().eq('user_id', userId);
      
      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: newRole as 'admin' | 'guild' | 'neutro' }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'User role updated successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating user role',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateSystemSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from('system_settings')
        .update({ setting_value: value })
        .eq('setting_key', key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast({ title: 'Setting updated successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating setting',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [usersCount, claimsCount, respawnsCount] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase
          .from('claims')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true),
        supabase.from('respawns').select('*', { count: 'exact', head: true }),
      ]);

      return {
        totalUsers: usersCount.count || 0,
        activeClaims: claimsCount.count || 0,
        totalRespawns: respawnsCount.count || 0,
      };
    },
  });

  return {
    users,
    settings,
    stats,
    isLoading: usersLoading || settingsLoading,
    updateUserRole,
    updateSystemSetting,
  };
};
