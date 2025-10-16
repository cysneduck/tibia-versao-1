import { RespawnCard } from "./RespawnCard";

interface Respawn {
  code: string;
  name: string;
  isClaimed?: boolean;
  claimedBy?: string;
  timeRemaining?: string;
  userHasPriority?: boolean;
  priorityExpiresAt?: string | null;
  someoneElseHasPriority?: boolean;
}

interface CitySectionProps {
  cityName: string;
  respawns: Respawn[];
  userType?: "guild" | "neutro";
  onClaimClick?: (respawn: any) => void;
  onReleaseClick?: (respawn: any) => void;
  onJoinQueue?: (respawn: any) => void;
  onLeaveQueue?: (respawn: any) => void;
  userId?: string;
}

export const CitySection = ({ cityName, respawns, userType, onClaimClick, onReleaseClick, onJoinQueue, onLeaveQueue, userId }: CitySectionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-primary glow-cyan tracking-wide border-b border-border pb-2">
        {cityName}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {respawns.map((respawn: any) => (
          <RespawnCard 
            key={respawn.code}
            code={respawn.code}
            name={respawn.name}
            isClaimed={respawn.isClaimed}
            claimedBy={respawn.claimedBy}
            timeRemaining={respawn.timeRemaining}
            userType={userType}
            onClaimClick={onClaimClick ? () => onClaimClick(respawn) : undefined}
            onReleaseClick={onReleaseClick ? () => onReleaseClick(respawn) : undefined}
            onJoinQueue={onJoinQueue ? () => onJoinQueue(respawn) : undefined}
            onLeaveQueue={onLeaveQueue ? () => onLeaveQueue(respawn) : undefined}
            claimId={respawn.claimId}
            isOwnClaim={respawn.claim?.user_id === userId}
            queueCount={respawn.queueCount}
            userInQueue={respawn.userInQueue}
            queuePosition={respawn.queuePosition}
            nextInQueue={respawn.nextInQueue}
            queueEntries={respawn.queueEntries}
            userId={userId}
            userHasPriority={respawn.userHasPriority}
            priorityExpiresAt={respawn.priorityExpiresAt}
            someoneElseHasPriority={respawn.someoneElseHasPriority}
          />
        ))}
      </div>
    </div>
  );
};
