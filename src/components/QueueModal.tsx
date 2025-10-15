import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Trophy, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface QueueEntry {
  id: string;
  character_name: string;
  user_id: string;
  joined_at: string;
}

interface QueueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  respawnCode: string;
  respawnName: string;
  queueEntries: QueueEntry[];
  currentUserId?: string;
}

export const QueueModal = ({
  open,
  onOpenChange,
  respawnCode,
  respawnName,
  queueEntries,
  currentUserId,
}: QueueModalProps) => {
  const sortedQueue = [...queueEntries].sort(
    (a, b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Next System for {respawnName}
            <Badge variant="outline" className="ml-2 font-mono text-xs">
              {respawnCode}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-3">
            {sortedQueue.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No one in the Next System yet</p>
              </div>
            ) : (
              sortedQueue.map((entry, index) => {
                const isCurrentUser = entry.user_id === currentUserId;
                const isNext = index === 0;

                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      isCurrentUser
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card/50"
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-semibold text-sm">
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {entry.character_name}
                        </span>
                        {isCurrentUser && (
                          <Badge variant="secondary" className="text-xs">
                            You
                          </Badge>
                        )}
                        {isNext && (
                          <Badge className="text-xs bg-primary/20 text-primary border-primary">
                            <Trophy className="h-3 w-3 mr-1" />
                            Next
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          Joined{" "}
                          {formatDistanceToNow(new Date(entry.joined_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
