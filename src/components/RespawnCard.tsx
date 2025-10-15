import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Users } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";
import { QueueModal } from "./QueueModal";

interface QueueEntry {
  id: string;
  character_name: string;
  user_id: string;
  joined_at: string;
}

interface RespawnCardProps {
  code: string;
  name: string;
  isClaimed?: boolean;
  claimedBy?: string;
  characterName?: string;
  timeRemaining?: string;
  userType?: "guild" | "neutro";
  onClaimClick?: () => void;
  onReleaseClick?: () => void;
  claimId?: string;
  isOwnClaim?: boolean;
  queueCount?: number;
  userInQueue?: boolean;
  queuePosition?: number | null;
  nextInQueue?: string;
  onJoinQueue?: () => void;
  onLeaveQueue?: () => void;
  queueEntries?: QueueEntry[];
  userId?: string;
}

export const RespawnCard = ({ 
  code, 
  name, 
  isClaimed = false, 
  claimedBy,
  characterName,
  timeRemaining,
  userType,
  onClaimClick,
  onReleaseClick,
  isOwnClaim,
  queueCount = 0,
  userInQueue = false,
  queuePosition,
  nextInQueue,
  onJoinQueue,
  onLeaveQueue,
  queueEntries = [],
  userId
}: RespawnCardProps) => {
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  return (
    <Card className={`transition-all duration-300 hover:scale-[1.02] ${
      isClaimed 
        ? 'border-glow-red bg-card/50' 
        : 'border-glow-cyan bg-card/80 hover:border-glow-cyan'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <Badge 
              variant="outline" 
              className={`mb-2 font-mono text-xs ${
                isClaimed ? 'border-secondary text-secondary' : 'border-primary text-primary glow-cyan'
              }`}
            >
              {code}
            </Badge>
            <CardTitle className="text-lg text-foreground">{name}</CardTitle>
          </div>
          <Badge 
            variant={isClaimed ? "destructive" : "default"}
            className={isClaimed ? 'bg-secondary/20 text-secondary border-secondary' : 'bg-primary/20 text-primary border-primary'}
          >
            {isClaimed ? "Claimed" : "Available"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isClaimed ? (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Claimed by: <span className="text-foreground font-medium">{characterName || claimedBy}</span></span>
            </div>
            {timeRemaining && <CountdownTimer expiresAt={timeRemaining} />}
            
            {queueCount > 0 && (
              <div 
                className="flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-md p-2 bg-card/50 cursor-pointer hover:bg-card/70 transition-colors"
                onClick={() => setQueueModalOpen(true)}
              >
                <Users className="h-4 w-4" />
                <span>{queueCount} {queueCount === 1 ? 'person' : 'people'} in Next</span>
                {nextInQueue && <span className="text-xs text-muted-foreground">Next: {nextInQueue}</span>}
              </div>
            )}
            
            {isOwnClaim && onReleaseClick && (
              <Button 
                variant="destructive"
                className="w-full"
                onClick={onReleaseClick}
              >
                Leave Respawn
              </Button>
            )}
            
            {!isOwnClaim && !userInQueue && onJoinQueue && (
              <Button 
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary/10"
                onClick={onJoinQueue}
              >
                Next
              </Button>
            )}
            
            {userInQueue && onLeaveQueue && (
              <Button 
                variant="outline"
                className="w-full"
                onClick={onLeaveQueue}
              >
                Leave Next
              </Button>
            )}
          </>
        ) : (
          <>
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-cyan font-semibold"
              onClick={onClaimClick}
            >
              Claim Respawn
            </Button>
            {queueCount > 0 && (
              <div 
                className="flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-md p-2 bg-card/50 cursor-pointer hover:bg-card/70 transition-colors"
                onClick={() => setQueueModalOpen(true)}
              >
                <Users className="h-4 w-4" />
                <span>{queueCount} {queueCount === 1 ? 'person' : 'people'} waiting</span>
              </div>
            )}
          </>
        )}
        {!isClaimed && userType && (
          <p className="text-xs text-muted-foreground text-center">
            Duration: {userType === "guild" ? "2h 15min" : "1h 15min"}
          </p>
        )}
      </CardContent>

      <QueueModal
        open={queueModalOpen}
        onOpenChange={setQueueModalOpen}
        respawnCode={code}
        respawnName={name}
        queueEntries={queueEntries}
        currentUserId={userId}
      />
    </Card>
  );
};
