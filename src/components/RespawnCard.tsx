import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Users, Bell } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";

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
  onLeaveQueue
}: RespawnCardProps) => {
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-md p-2 bg-card/50">
                <Users className="h-4 w-4" />
                <span>{queueCount} {queueCount === 1 ? 'person' : 'people'} in queue</span>
                {nextInQueue && <span className="text-xs text-muted-foreground">Next: {nextInQueue}</span>}
              </div>
            )}
            
            {userInQueue && queuePosition && (
              <div className="flex items-center gap-2 text-sm border border-primary rounded-md p-2 bg-primary/10">
                <Bell className="h-4 w-4 text-primary" />
                <span className="text-primary font-medium">You are #{queuePosition} in queue</span>
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
                Join Queue
              </Button>
            )}
            
            {userInQueue && onLeaveQueue && (
              <Button 
                variant="outline"
                className="w-full"
                onClick={onLeaveQueue}
              >
                Leave Queue
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-md p-2 bg-card/50">
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
    </Card>
  );
};
