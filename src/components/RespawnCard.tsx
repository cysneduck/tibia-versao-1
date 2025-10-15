import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";

interface RespawnCardProps {
  code: string;
  name: string;
  isClaimed?: boolean;
  claimedBy?: string;
  timeRemaining?: string;
  userType?: "guild" | "neutro";
}

export const RespawnCard = ({ 
  code, 
  name, 
  isClaimed = false, 
  claimedBy, 
  timeRemaining,
  userType 
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
              <span>Claimed by: <span className="text-foreground font-medium">{claimedBy}</span></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-secondary" />
              <span className="text-secondary glow-red font-medium">{timeRemaining}</span>
            </div>
          </>
        ) : (
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-cyan font-semibold"
          >
            Claim Respawn
          </Button>
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
