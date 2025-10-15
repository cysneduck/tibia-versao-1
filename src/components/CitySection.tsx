import { RespawnCard } from "./RespawnCard";

interface Respawn {
  code: string;
  name: string;
  isClaimed?: boolean;
  claimedBy?: string;
  timeRemaining?: string;
}

interface CitySectionProps {
  cityName: string;
  respawns: Respawn[];
  userType?: "guild" | "neutro";
}

export const CitySection = ({ cityName, respawns, userType }: CitySectionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-primary glow-cyan tracking-wide border-b border-border pb-2">
        {cityName}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {respawns.map((respawn) => (
          <RespawnCard 
            key={respawn.code}
            code={respawn.code}
            name={respawn.name}
            isClaimed={respawn.isClaimed}
            claimedBy={respawn.claimedBy}
            timeRemaining={respawn.timeRemaining}
            userType={userType}
          />
        ))}
      </div>
    </div>
  );
};
