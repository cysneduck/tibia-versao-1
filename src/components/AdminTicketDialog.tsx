import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Ticket } from "@/hooks/useTickets";
import { useAdminTickets } from "@/hooks/useAdminTickets";
import { useAuth } from "@/hooks/useAuth";

interface AdminTicketDialogProps {
  ticket: (Ticket & { profiles: { email: string } }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdminTicketDialog = ({ ticket, open, onOpenChange }: AdminTicketDialogProps) => {
  const { user } = useAuth();
  const { updateTicketStatus, updateTicketPriority, addAdminNotes } = useAdminTickets();
  const [notes, setNotes] = useState(ticket?.admin_notes || "");
  const [status, setStatus] = useState(ticket?.status || "");
  const [priority, setPriority] = useState(ticket?.priority || "");

  const handleSaveNotes = () => {
    if (ticket) {
      addAdminNotes.mutate({ ticketId: ticket.id, notes });
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (ticket && user) {
      setStatus(newStatus);
      updateTicketStatus.mutate({ ticketId: ticket.id, status: newStatus, userId: user.id });
    }
  };

  const handlePriorityChange = (newPriority: string) => {
    if (ticket) {
      setPriority(newPriority);
      updateTicketPriority.mutate({ 
        ticketId: ticket.id, 
        priority: newPriority as 'low' | 'medium' | 'high' | 'urgent' 
      });
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'bug': return '🐛 Bug';
      case 'suggestion': return '💡 Suggestion';
      case 'ks_report': return '⚔️ KS Report';
      case 'other': return '📝 Other';
      default: return category;
    }
  };

  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ticket.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Ticket Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">User Email</Label>
              <p className="font-medium">{ticket.profiles.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Category</Label>
              <p className="font-medium">{getCategoryLabel(ticket.category)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Created</Label>
              <p className="font-medium">{format(new Date(ticket.created_at), "PPpp")}</p>
            </div>
            {ticket.resolved_at && (
              <div>
                <Label className="text-muted-foreground">Resolved</Label>
                <p className="font-medium">{format(new Date(ticket.resolved_at), "PPpp")}</p>
              </div>
            )}
          </div>

          {/* Status and Priority Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={handlePriorityChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <div className="mt-2 p-4 bg-muted rounded-lg">
              <p className="whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>

          {/* Screenshots */}
          {ticket.screenshot_urls && ticket.screenshot_urls.length > 0 && (
            <div>
              <Label>Screenshots ({ticket.screenshot_urls.length})</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {ticket.screenshot_urls.map((url, index) => (
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

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label>Admin Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this ticket..."
              rows={4}
            />
            <Button onClick={handleSaveNotes} disabled={addAdminNotes.isPending}>
              Save Notes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};