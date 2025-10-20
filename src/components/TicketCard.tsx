import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Ticket } from "@/hooks/useTickets";
import { Bug, Lightbulb, Swords, FileText, Circle } from "lucide-react";

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
}

export const TicketCard = ({ ticket, onClick }: TicketCardProps) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug': return <Bug className="h-4 w-4" />;
      case 'suggestion': return <Lightbulb className="h-4 w-4" />;
      case 'ks_report': return <Swords className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bug': return 'border-red-500 text-red-500 bg-red-500/10';
      case 'suggestion': return 'border-blue-500 text-blue-500 bg-blue-500/10';
      case 'ks_report': return 'border-orange-500 text-orange-500 bg-orange-500/10';
      default: return 'border-gray-500 text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'border-yellow-500 text-yellow-500';
      case 'in_progress': return 'border-blue-500 text-blue-500';
      case 'resolved': return 'border-green-500 text-green-500';
      case 'closed': return 'border-gray-500 text-gray-500';
      default: return 'border-gray-500 text-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

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

  return (
    <Card 
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{ticket.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {format(new Date(ticket.created_at), "MMM dd, yyyy HH:mm")}
            </p>
          </div>
          <Circle 
            className={`h-3 w-3 fill-current ${getPriorityColor(ticket.priority)} ${
              ticket.priority === 'urgent' ? 'animate-pulse' : ''
            }`}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={getCategoryColor(ticket.category)}>
            <span className="flex items-center gap-1">
              {getCategoryIcon(ticket.category)}
              {getCategoryLabel(ticket.category)}
            </span>
          </Badge>
          <Badge variant="outline" className={getStatusColor(ticket.status)}>
            {getStatusLabel(ticket.status)}
          </Badge>
        </div>
        {ticket.screenshot_urls && ticket.screenshot_urls.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            📎 {ticket.screenshot_urls.length} screenshot{ticket.screenshot_urls.length > 1 ? 's' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  );
};