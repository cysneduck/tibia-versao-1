import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FilterBar } from "@/components/FilterBar";
import { CitySection } from "@/components/CitySection";
import { ClaimDialog } from "@/components/ClaimDialog";
import { useRespawns } from "@/hooks/useRespawns";
import { useClaims } from "@/hooks/useClaims";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user, userRole } = useAuth();
  const { respawns, isLoading } = useRespawns();
  const { claimRespawn } = useClaims(user?.id);
  const { profile, characters } = useProfile(user?.id);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [selectedRespawn, setSelectedRespawn] = useState<any>(null);

  const cities = Array.from(new Set(respawns.map(r => r.city))).sort();
  
  const filteredRespawns = respawns.filter(respawn => {
    const matchesSearch = respawn.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         respawn.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === "all" || respawn.city === selectedCity;
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "available" && !respawn.claim) ||
                         (selectedStatus === "claimed" && respawn.claim);
    
    return matchesSearch && matchesCity && matchesStatus;
  });

  const groupedRespawns = filteredRespawns.reduce((acc, respawn) => {
    if (!acc[respawn.city]) {
      acc[respawn.city] = [];
    }
    acc[respawn.city].push(respawn);
    return acc;
  }, {} as Record<string, typeof respawns>);

  const activeCharacter = characters?.find(c => c.id === profile?.active_character_id);

  const handleConfirmClaim = async () => {
    if (!activeCharacter || !selectedRespawn) return;
    
    claimRespawn.mutate(
      { respawnId: selectedRespawn.id, characterId: activeCharacter.id },
      {
        onSuccess: () => {
          setClaimDialogOpen(false);
          setSelectedRespawn(null);
        },
      }
    );
  };

  const duration = userRole === 'guild' ? '2 hours 15 minutes' : '1 hour 15 minutes';

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading respawns...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Available Respawns</h1>
          <p className="text-muted-foreground">Manage and track respawn claims</p>
        </div>

        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          cities={cities}
        />

        <div className="space-y-8">
          {Object.keys(groupedRespawns).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No respawns found matching your filters.</p>
            </div>
          ) : (
            Object.entries(groupedRespawns).map(([city, cityRespawns]) => (
              <CitySection
                key={city}
                cityName={city}
                respawns={cityRespawns.map(r => ({
                  code: r.code,
                  name: r.name,
                  isClaimed: !!r.claim,
                  claimedBy: r.claim?.character_name,
                  characterName: r.claim?.character_name,
                  timeRemaining: r.claim?.expires_at,
                  respawnId: r.id,
                  claimId: r.claim?.id,
                  userId: r.claim?.user_id,
                }))}
                userType={userRole as 'guild' | 'neutro'}
                onClaimClick={(respawn) => {
                  setSelectedRespawn({ id: respawn.respawnId, ...respawn });
                  setClaimDialogOpen(true);
                }}
              />
            ))
          )}
        </div>
      </div>

      {selectedRespawn && activeCharacter && (
        <ClaimDialog
          open={claimDialogOpen}
          onOpenChange={setClaimDialogOpen}
          respawnCode={selectedRespawn.code}
          respawnName={selectedRespawn.name}
          characterName={activeCharacter.name}
          duration={duration}
          onConfirm={handleConfirmClaim}
          isLoading={claimRespawn.isPending}
        />
      )}
    </DashboardLayout>
  );
}
