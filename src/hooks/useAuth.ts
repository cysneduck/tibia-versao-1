import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

type UserRole = 'admin' | 'guild' | 'neutro' | 'master_admin';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    // Initialize from localStorage if available
    const cached = localStorage.getItem('user_role');
    return cached ? (cached as UserRole) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
        localStorage.removeItem('user_role');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error);
      }
      // If no role found, default to neutro
      const role = (data?.role as UserRole) || 'neutro';
      setUserRole(role);
      // Persist to localStorage
      localStorage.setItem('user_role', role);
    } catch (error) {
      console.error('Error fetching user role:', error);
      const defaultRole = 'neutro';
      setUserRole(defaultRole);
      localStorage.setItem('user_role', defaultRole);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('user_role');
    await supabase.auth.signOut();
  };

  const isAdmin = userRole === 'admin' || userRole === 'master_admin';
  const isMasterAdmin = userRole === 'master_admin';

  return {
    user,
    userRole,
    loading,
    signOut,
    isAdmin,
    isMasterAdmin,
  };
};
