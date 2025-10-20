import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Ticket } from "./useTickets";

export const useAdminTickets = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all tickets
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user emails separately
      const ticketsWithEmails = await Promise.all(
        (data || []).map(async (ticket) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', ticket.user_id)
            .single();
          
          return {
            ...ticket,
            profiles: { email: profile?.email || 'Unknown' }
          };
        })
      );

      return ticketsWithEmails as (Ticket & { profiles: { email: string } })[];
    },
  });

  // Get ticket stats
  const { data: stats } = useQuery({
    queryKey: ['ticket-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('status');

      if (error) throw error;

      const total = data.length;
      const open = data.filter(t => t.status === 'open').length;
      const inProgress = data.filter(t => t.status === 'in_progress').length;
      const resolved = data.filter(t => t.status === 'resolved').length;

      return { total, open, inProgress, resolved };
    },
  });

  // Update ticket status
  const updateTicketStatus = useMutation({
    mutationFn: async ({ ticketId, status, userId }: { 
      ticketId: string; 
      status: string;
      userId: string;
    }) => {
      const updates: any = { status };
      
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
        updates.resolved_by = userId;
      }

      const { error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', ticketId);

      if (error) throw error;

      // Notify ticket owner
      const { data: ticket } = await supabase
        .from('tickets')
        .select('user_id, title')
        .eq('id', ticketId)
        .single();

      if (ticket) {
        await supabase.from('notifications').insert({
          user_id: ticket.user_id,
          title: 'Ticket Updated',
          message: `Your ticket "${ticket.title}" status changed to ${status}`,
          type: 'ticket_update',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
      toast({
        title: "Status updated",
        description: "Ticket status has been updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    },
  });

  // Update ticket priority
  const updateTicketPriority = useMutation({
    mutationFn: async ({ ticketId, priority }: { 
      ticketId: string; 
      priority: 'low' | 'medium' | 'high' | 'urgent' 
    }) => {
      const { error } = await supabase
        .from('tickets')
        .update({ priority })
        .eq('id', ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      toast({
        title: "Priority updated",
        description: "Ticket priority has been updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating priority:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket priority",
        variant: "destructive",
      });
    },
  });

  // Add admin notes
  const addAdminNotes = useMutation({
    mutationFn: async ({ ticketId, notes }: { ticketId: string; notes: string }) => {
      const { error } = await supabase
        .from('tickets')
        .update({ admin_notes: notes })
        .eq('id', ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      toast({
        title: "Notes saved",
        description: "Admin notes have been saved successfully",
      });
    },
    onError: (error) => {
      console.error('Error saving notes:', error);
      toast({
        title: "Error",
        description: "Failed to save admin notes",
        variant: "destructive",
      });
    },
  });

  return {
    tickets,
    stats,
    isLoading,
    updateTicketStatus,
    updateTicketPriority,
    addAdminNotes,
  };
};