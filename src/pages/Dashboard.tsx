import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FilterBar } from "@/components/FilterBar";
import { CitySection } from "@/components/CitySection";
import { ClaimDialog } from "@/components/ClaimDialog";
import { toast } from "sonner";

// Mock data
const mockRespawns = [
  // Ankrahmun
  { code: "B17", name: "Cobra Bastion", city: "Ankrahmun", isClaimed: true, claimedBy: "Dragon Slayer", characterName: "Dragon Slayer", timeRemaining: "2024-12-31T15:30:00" },
  
  // Carlin
  { code: "C5", name: "Secret Library (Fire Area)", city: "Carlin", isClaimed: false },
  { code: "C7", name: "Secret Library (Energy Area)", city: "Carlin", isClaimed: false },
  
  // Cormaya
  { code: "X2", name: "Inqol -2", city: "Cormaya", isClaimed: true, claimedBy: "Dark Knight", characterName: "Dark Knight", timeRemaining: "2024-12-31T14:00:00" },
  { code: "X3", name: "Inqol -3", city: "Cormaya", isClaimed: false },
  
  // Darashia
  { code: "D19", name: "Ferumbra's Lair (Entrance)", city: "Darashia", isClaimed: false },
  { code: "D20", name: "Ferumbra's Plague Seal - 2", city: "Darashia", isClaimed: false },
  { code: "D21", name: "Ferumbra's Plague Seal - 1", city: "Darashia", isClaimed: true, claimedBy: "Shadow Paladin", characterName: "Shadow Paladin", timeRemaining: "2024-12-31T13:20:00" },
  
  // Edron
  { code: "E29", name: "Falcon Bastion", city: "Edron", isClaimed: false },
  
  // Issavi
  { code: "K12", name: "Ruins of Nuur (Blu)", city: "Issavi", isClaimed: false },
  { code: "K13", name: "Salt Caves (Bashmu)", city: "Issavi", isClaimed: false },
  
  // Port Hope
  { code: "P19", name: "True Asura -1", city: "Port Hope", isClaimed: true, claimedBy: "Mystic Sorcerer", characterName: "Mystic Sorcerer", timeRemaining: "2024-12-31T16:45:00" },
  { code: "P20", name: "True Asura -2", city: "Port Hope", isClaimed: false },
  
  // Roshamuul
  { code: "Q3", name: "Guzzlemaw Valley (East)", city: "Roshamuul", isClaimed: false },
  { code: "Q4", name: "Guzzlemaw Valley (West)", city: "Roshamuul", isClaimed: false },
  
  // Venore
  { code: "T13", name: "Flimsy -1", city: "Venore", isClaimed: false },
  { code: "T14", name: "Flimsy -2", city: "Venore", isClaimed: false },
  
  // Warzone
  { code: "U5", name: "Warzone 3", city: "Warzone", isClaimed: false },
  { code: "U16", name: "Warzone 7 -1", city: "Warzone", isClaimed: false },
  { code: "U17", name: "Warzone 7 -2", city: "Warzone", isClaimed: false },
  { code: "U18", name: "Warzone 8", city: "Warzone", isClaimed: false },
];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [selectedRespawn, setSelectedRespawn] = useState<any>(null);

  const cities = Array.from(new Set(mockRespawns.map(r => r.city))).sort();
  
  const filteredRespawns = mockRespawns.filter(respawn => {
    const matchesSearch = respawn.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         respawn.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === "all" || respawn.city === selectedCity;
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "available" && !respawn.isClaimed) ||
                         (selectedStatus === "claimed" && respawn.isClaimed);
    
    return matchesSearch && matchesCity && matchesStatus;
  });

  const groupedRespawns = filteredRespawns.reduce((acc, respawn) => {
    if (!acc[respawn.city]) {
      acc[respawn.city] = [];
    }
    acc[respawn.city].push(respawn);
    return acc;
  }, {} as Record<string, typeof mockRespawns>);

  // Active character for claiming
  const activeCharacter = "Dark Knight";

  const handleClaimClick = (respawn: any) => {
    setSelectedRespawn(respawn);
    setClaimDialogOpen(true);
  };

  const handleConfirmClaim = () => {
    toast.success(`Successfully claimed ${selectedRespawn.code} - ${selectedRespawn.name}!`);
    setClaimDialogOpen(false);
    setSelectedRespawn(null);
  };

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
            Object.entries(groupedRespawns).map(([city, respawns]) => (
              <CitySection
                key={city}
                cityName={city}
                respawns={respawns}
                userType="guild"
              />
            ))
          )}
        </div>
      </div>

      {selectedRespawn && (
        <ClaimDialog
          open={claimDialogOpen}
          onOpenChange={setClaimDialogOpen}
          respawnCode={selectedRespawn.code}
          respawnName={selectedRespawn.name}
          characterName={activeCharacter}
          duration="2 hours 15 minutes"
          onConfirm={handleConfirmClaim}
        />
      )}
    </DashboardLayout>
  );
}
