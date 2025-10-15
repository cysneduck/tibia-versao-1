import { Header } from "@/components/Header";
import { CitySection } from "@/components/CitySection";

const Index = () => {
  // Mock data for demonstration - showing logged in guild member
  const mockUserType: "guild" | "neutro" = "guild";
  
  const respawnData = {
    Ankrahmun: [
      { code: "B17", name: "Cobra Bastion", isClaimed: true, claimedBy: "DragonSlayer", timeRemaining: "1h 45min" }
    ],
    Carlin: [
      { code: "C5", name: "Secret Library (Fire Area)", isClaimed: false },
      { code: "C7", name: "Secret Library (Energy Area)", isClaimed: false }
    ],
    Cormaya: [
      { code: "X2", name: "Inqol -2", isClaimed: false },
      { code: "X3", name: "Inqol -3", isClaimed: true, claimedBy: "MageKnight", timeRemaining: "0h 32min" }
    ],
    "Darashia (Part 1)": [
      { code: "D19", name: "Ferumbra's Lair (Entrance)", isClaimed: false },
      { code: "D20", name: "Ferumbra's Plague Seal - 2", isClaimed: false },
      { code: "D21", name: "Ferumbra's Plague Seal - 1", isClaimed: true, claimedBy: "ShadowHunter", timeRemaining: "2h 05min" },
      { code: "D22", name: "Ferumbra's DT Seal", isClaimed: false },
      { code: "D23", name: "Ferumbra's Jugger Seal", isClaimed: false },
      { code: "D24", name: "Ferumbra's Fury Seal", isClaimed: false }
    ],
    "Darashia (Part 2)": [
      { code: "D25", name: "Ferumbra's Undead Seal - 1", isClaimed: false },
      { code: "D26", name: "Ferumbra's Arc", isClaimed: false },
      { code: "D27", name: "Ferumbra's Pumin", isClaimed: false },
      { code: "D28", name: "Ferumbra's Fury Seal + 1", isClaimed: false },
      { code: "D29", name: "Ferumbra's Undead Seal - 2", isClaimed: false }
    ],
    Edron: [
      { code: "E29", name: "Falcon Bastion", isClaimed: false }
    ],
    Issavi: [
      { code: "K12", name: "Ruins of Nuur (Blu)", isClaimed: false },
      { code: "K13", name: "Salt Caves (Bashmu)", isClaimed: true, claimedBy: "NeutroPlayer", timeRemaining: "0h 58min" }
    ],
    "Port Hope": [
      { code: "P19", name: "True Asura -1", isClaimed: false },
      { code: "P20", name: "True Asura -2", isClaimed: false }
    ],
    Roshamuul: [
      { code: "Q3", name: "Guzzlemaw Valley (East)", isClaimed: false },
      { code: "Q4", name: "Guzzlemaw Valley (West)", isClaimed: false }
    ],
    Venore: [
      { code: "T13", name: "Flimsy -1", isClaimed: false },
      { code: "T14", name: "Flimsy -2", isClaimed: false }
    ],
    Warzone: [
      { code: "U5", name: "Warzone 3", isClaimed: false },
      { code: "U16", name: "Warzone 7 -1", isClaimed: false },
      { code: "U17", name: "Warzone 7 -2", isClaimed: false },
      { code: "U18", name: "Warzone 8", isClaimed: false }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn={true} username="YourCharacter" userType={mockUserType} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-primary glow-cyan mb-2">
            World Respawn Status
          </h2>
          <p className="text-muted-foreground">
            Track and claim respawns across Tibia. Guild members: 2h 15min | Neutros: 1h 15min
          </p>
        </div>

        <div className="space-y-8">
          {Object.entries(respawnData).map(([city, respawns]) => (
            <CitySection 
              key={city}
              cityName={city}
              respawns={respawns}
              userType={mockUserType}
            />
          ))}
        </div>
      </main>

      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Tibia Respawn Keeper - Managing your hunting grounds efficiently</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
