import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TicketDialog } from "@/components/TicketDialog";
import { TicketCard } from "@/components/TicketCard";
import { useAuth } from "@/hooks/useAuth";
import { useTickets } from "@/hooks/useTickets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Ticket } from "@/hooks/useTickets";

export default function Tickets() {
  const { user } = useAuth();
  const { tickets, isLoading } = useTickets(user?.id);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const openTickets = tickets?.filter(t => t.status === 'open') || [];
  const inProgressTickets = tickets?.filter(t => t.status === 'in_progress') || [];
  const resolvedTickets = tickets?.filter(t => t.status === 'resolved' || t.status === 'closed') || [];

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'bug': return 'Bug';
      case 'suggestion': return 'Suggestion';
      case 'ks_report': return 'KS Report';
      case 'other': return 'Other';
      default: return category;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading tickets...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Support Tickets</h1>
            <p className="text-muted-foreground mt-1">Manage your support tickets</p>
          </div>
          <TicketDialog />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({tickets?.length || 0})</TabsTrigger>
            <TabsTrigger value="open">Open ({openTickets.length})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({inProgressTickets.length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({resolvedTickets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {tickets && tickets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tickets.map(ticket => (
                  <TicketCard 
                    key={ticket.id} 
                    ticket={ticket} 
                    onClick={() => setSelectedTicket(ticket)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tickets yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="open" className="space-y-4 mt-6">
            {openTickets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {openTickets.map(ticket => (
                  <TicketCard 
                    key={ticket.id} 
                    ticket={ticket} 
                    onClick={() => setSelectedTicket(ticket)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No open tickets</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="in_progress" className="space-y-4 mt-6">
            {inProgressTickets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inProgressTickets.map(ticket => (
                  <TicketCard 
                    key={ticket.id} 
                    ticket={ticket} 
                    onClick={() => setSelectedTicket(ticket)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tickets in progress</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4 mt-6">
            {resolvedTickets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resolvedTickets.map(ticket => (
                  <TicketCard 
                    key={ticket.id} 
                    ticket={ticket} 
                    onClick={() => setSelectedTicket(ticket)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No resolved tickets</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Ticket Details Dialog */}
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedTicket && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedTicket.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{getCategoryLabel(selectedTicket.category)}</Badge>
                    <Badge variant="outline">{getStatusLabel(selectedTicket.status)}</Badge>
                    <Badge variant="outline">Priority: {selectedTicket.priority}</Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedTicket.description}</p>
                  </div>

                  {selectedTicket.screenshot_urls && selectedTicket.screenshot_urls.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Screenshots</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedTicket.screenshot_urls.map((url, index) => (
                          <a 
                            key={index} 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block border rounded overflow-hidden hover:opacity-75 transition-opacity"
                          >
                            <img src={url} alt={`Screenshot ${index + 1}`} className="w-full h-auto" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTicket.admin_notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Admin Notes</h4>
                      <p className="text-muted-foreground bg-muted p-3 rounded">{selectedTicket.admin_notes}</p>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    <p>Created: {format(new Date(selectedTicket.created_at), "PPpp")}</p>
                    {selectedTicket.resolved_at && (
                      <p>Resolved: {format(new Date(selectedTicket.resolved_at), "PPpp")}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}