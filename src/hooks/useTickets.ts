import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Ticket {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'bug' | 'suggestion' | 'ks_report' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  screenshot_urls: string[];
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  admin_notes: string | null;
}

export const useTickets = (userId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's tickets
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Ticket[];
    },
    enabled: !!userId,
  });

  // Create ticket
  const createTicket = useMutation({
    mutationFn: async (ticket: {
      title: string;
      description: string;
      category: string;
      screenshot_urls?: string[];
    }) => {
      if (!userId) throw new Error('User not authenticated');

      // Auto-assign priority based on category
      let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
      if (ticket.category === 'ks_report') priority = 'high';
      else if (ticket.category === 'bug') priority = 'medium';
      else priority = 'low';

      const { data, error } = await supabase
        .from('tickets')
        .insert({
          user_id: userId,
          title: ticket.title,
          description: ticket.description,
          category: ticket.category as any,
          priority: priority as any,
          screenshot_urls: ticket.screenshot_urls || [],
        })
        .select()
        .single();

      if (error) throw error;

      // Notify admins about new ticket
      const { data: admins } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['admin', 'master_admin']);

      if (admins) {
        const notifications = admins.map(admin => ({
          user_id: admin.user_id,
          title: 'New Support Ticket',
          message: `[${ticket.category.toUpperCase()}] - ${ticket.title}`,
          type: 'new_ticket',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }));

        await supabase.from('notifications').insert(notifications);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast({
        title: "Ticket created",
        description: "Your support ticket has been submitted successfully",
      });
    },
    onError: (error) => {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to create ticket",
        variant: "destructive",
      });
    },
  });

  // Upload screenshot
  const uploadScreenshot = async (file: File): Promise<string> => {
    if (!userId) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('ticket-screenshots')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Generate signed URL with 1 year expiration for ticket screenshots
    const { data, error } = await supabase.storage
      .from('ticket-screenshots')
      .createSignedUrl(fileName, 31536000); // 1 year in seconds

    if (error) throw error;

    return data.signedUrl;
  };

  return {
    tickets,
    isLoading,
    createTicket,
    uploadScreenshot,
  };
};