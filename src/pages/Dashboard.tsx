import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FilterBar } from "@/components/FilterBar";
import { CitySection } from "@/components/CitySection";
import { ClaimDialog } from "@/components/ClaimDialog";
import { ReleaseDialog } from "@/components/ReleaseDialog";
import { NotificationPermissionBanner } from "@/components/NotificationPermissionBanner";
import { UrgentClaimModal } from "@/components/UrgentClaimModal";
import { useRespawns } from "@/hooks/useRespawns";
import { useClaims } from "@/hooks/useClaims";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useQueue } from "@/hooks/useQueue";
import { useNotifications } from "@/hooks/useNotifications";
import { useFavorites } from "@/hooks/useFavorites";

export default function Dashboard() {
  const { user, userRole } = useAuth();
  const { respawns, isLoading } = useRespawns(user?.id);
  const { claimRespawn, releaseClaim } = useClaims(user?.id);
  const { profile, characters } = useProfile(user?.id);
  const { queueData, joinQueue, leaveQueue } = useQueue(user?.id);
  const { urgentClaim, setUrgentClaim } = useNotifications(user?.id, profile?.desktop_notifications ?? true);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites(user?.id);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [selectedRespawn, setSelectedRespawn] = useState<any>(null);

  const cities = Array.from(new Set(respawns.map(r => r.city))).sort();
  
  const filteredRespawns = respawns.filter(respawn => {
    const matchesSearch = respawn.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         respawn.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === "all" || respawn.city === selectedCity;
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "available" && !respawn.claim) ||
                         (selectedStatus === "claimed" && respawn.claim);
    const matchesFavorite = !showFavoritesOnly || respawn.is_favorite;
    
    return matchesSearch && matchesCity && matchesStatus && matchesFavorite;
  });

  // Extract favorites separately
  const favoriteRespawns = filteredRespawns.filter(r => r.is_favorite);
  const nonFavoriteRespawns = filteredRespawns.filter(r => !r.is_favorite);

  const groupedRespawns = nonFavoriteRespawns.reduce((acc, respawn) => {
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

  const handleConfirmRelease = async () => {
    if (!selectedRespawn?.claimId) return;
    
    releaseClaim.mutate(selectedRespawn.claimId, {
      onSuccess: () => {
        setReleaseDialogOpen(false);
        setSelectedRespawn(null);
      },
    });
  };

  const handleToggleFavorite = (respawnId: string) => {
    if (isFavorite(respawnId)) {
      removeFavorite.mutate(respawnId);
    } else {
      addFavorite.mutate(respawnId);
    }
  };

  // Duration based on user role (matches backend logic in claim_respawn function)
  const duration = ['guild', 'admin', 'master_admin'].includes(userRole || '') 
    ? '2 hours 30 minutes' 
    : '1 hour 15 minutes';

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Respawns</h1>
          <p className="text-muted-foreground">Manage and track respawn claims</p>
        </div>

        <NotificationPermissionBanner />

        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          cities={cities}
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavoritesOnly={() => setShowFavoritesOnly(!showFavoritesOnly)}
        />

        <div className="space-y-8">
          {favoriteRespawns.length === 0 && Object.keys(groupedRespawns).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No respawns found matching your filters.</p>
            </div>
          ) : (
            <>
              {favoriteRespawns.length > 0 && (
                <CitySection
                  key="favorites"
                  cityName="Favorites"
                  isFavoritesSection={true}
                  respawns={favoriteRespawns.map(r => {
                    const queueEntries = queueData.filter(q => q.respawn_id === r.id);
                    const userInQueue = queueEntries.find(q => q.user_id === user?.id);
                    const queuePosition = userInQueue 
                      ? queueEntries.findIndex(q => q.user_id === user?.id) + 1 
                      : null;
                    
                    const priorityEntry = queueEntries.find(q => 
                      q.priority_expires_at && new Date(q.priority_expires_at) > new Date()
                    );
                    const userHasPriority = priorityEntry?.user_id === user?.id;
                    const someoneElseHasPriority = priorityEntry && priorityEntry.user_id !== user?.id;
                    
                    return {
                      code: r.code,
                      name: r.name,
                      isClaimed: !!r.claim,
                      claimedBy: r.claim?.character_name,
                      characterName: r.claim?.character_name,
                      timeRemaining: r.claim?.expires_at,
                      respawnId: r.id,
                      claimId: r.claim?.id,
                      claim: r.claim,
                      queueCount: queueEntries.length,
                      userInQueue: !!userInQueue,
                      queuePosition,
                      nextInQueue: queueEntries[0]?.character_name,
                      queueEntries: queueEntries,
                      userHasPriority,
                      priorityExpiresAt: priorityEntry?.priority_expires_at || null,
                      someoneElseHasPriority,
                      is_favorite: r.is_favorite,
                    };
                  })}
                  userType={userRole as 'guild' | 'neutro'}
                  userId={user?.id}
                  onClaimClick={(respawn) => {
                    setSelectedRespawn({ id: respawn.respawnId, ...respawn });
                    setClaimDialogOpen(true);
                  }}
                  onReleaseClick={(respawn) => {
                    setSelectedRespawn({ id: respawn.respawnId, ...respawn });
                    setReleaseDialogOpen(true);
                  }}
                  onJoinQueue={(respawn) => {
                    if (activeCharacter) {
                      joinQueue.mutate({ respawnId: respawn.respawnId, characterId: activeCharacter.id });
                    }
                  }}
                  onLeaveQueue={(respawn) => {
                    leaveQueue.mutate(respawn.respawnId);
                  }}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}
              
              {!showFavoritesOnly && Object.entries(groupedRespawns).map(([city, cityRespawns]) => (
              <CitySection
                key={city}
                cityName={city}
                respawns={cityRespawns.map(r => {
                  const queueEntries = queueData.filter(q => q.respawn_id === r.id);
                  const userInQueue = queueEntries.find(q => q.user_id === user?.id);
                  const queuePosition = userInQueue 
                    ? queueEntries.findIndex(q => q.user_id === user?.id) + 1 
                    : null;
                  
                  // Check for priority
                  const priorityEntry = queueEntries.find(q => 
                    q.priority_expires_at && new Date(q.priority_expires_at) > new Date()
                  );
                  const userHasPriority = priorityEntry?.user_id === user?.id;
                  const someoneElseHasPriority = priorityEntry && priorityEntry.user_id !== user?.id;
                  
                  return {
                    code: r.code,
                    name: r.name,
                    isClaimed: !!r.claim,
                    claimedBy: r.claim?.character_name,
                    characterName: r.claim?.character_name,
                    timeRemaining: r.claim?.expires_at,
                    respawnId: r.id,
                    claimId: r.claim?.id,
                    claim: r.claim,
                    queueCount: queueEntries.length,
                    userInQueue: !!userInQueue,
                    queuePosition,
                    nextInQueue: queueEntries[0]?.character_name,
                    queueEntries: queueEntries,
                    userHasPriority,
                    priorityExpiresAt: priorityEntry?.priority_expires_at || null,
                    someoneElseHasPriority,
                    is_favorite: r.is_favorite,
                  };
                })}
                userType={userRole as 'guild' | 'neutro'}
                userId={user?.id}
                onClaimClick={(respawn) => {
                  setSelectedRespawn({ id: respawn.respawnId, ...respawn });
                  setClaimDialogOpen(true);
                }}
                onReleaseClick={(respawn) => {
                  setSelectedRespawn({ id: respawn.respawnId, ...respawn });
                  setReleaseDialogOpen(true);
                }}
                onJoinQueue={(respawn) => {
                  if (activeCharacter) {
                    joinQueue.mutate({ respawnId: respawn.respawnId, characterId: activeCharacter.id });
                  }
                }}
                onLeaveQueue={(respawn) => {
                  leaveQueue.mutate(respawn.respawnId);
                }}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
            </>
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

      {selectedRespawn && (
        <ReleaseDialog
          open={releaseDialogOpen}
          onOpenChange={setReleaseDialogOpen}
          respawnCode={selectedRespawn.code}
          respawnName={selectedRespawn.name}
          onConfirm={handleConfirmRelease}
          isLoading={releaseClaim.isPending}
        />
      )}

      {urgentClaim && urgentClaim.respawn_id && urgentClaim.expires_at && (
        <UrgentClaimModal
          open={!!urgentClaim}
          onOpenChange={(open) => !open && setUrgentClaim(null)}
          respawnCode={urgentClaim.title.split(' - ')[0] || 'Respawn'}
          respawnName={urgentClaim.title.split(' - ')[1] || 'Disponível'}
          expiresAt={urgentClaim.expires_at}
        />
      )}
    </DashboardLayout>
  );
}
