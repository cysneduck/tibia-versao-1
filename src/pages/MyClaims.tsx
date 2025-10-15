import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ReleaseDialog } from "@/components/ReleaseDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { XCircle, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const mockActiveClaims = [
  {
    id: "1",
    code: "X2",
    name: "Inqol -2",
    city: "Cormaya",
    claimedAt: "2024-12-31T12:00:00",
    expiresAt: "2024-12-31T14:15:00",
  },
  {
    id: "2",
    code: "B17",
    name: "Cobra Bastion",
    city: "Ankrahmun",
    claimedAt: "2024-12-31T13:00:00",
    expiresAt: "2024-12-31T15:15:00",
  },
];

const mockClaimHistory = [
  {
    id: "3",
    code: "E29",
    name: "Falcon Bastion",
    city: "Edron",
    claimedAt: "2024-12-30T10:00:00",
    releasedAt: "2024-12-30T12:15:00",
    duration: "2h 15m",
  },
  {
    id: "4",
    code: "P19",
    name: "True Asura -1",
    city: "Port Hope",
    claimedAt: "2024-12-29T14:00:00",
    releasedAt: "2024-12-29T16:15:00",
    duration: "2h 15m",
  },
  {
    id: "5",
    code: "Q3",
    name: "Guzzlemaw Valley (East)",
    city: "Roshamuul",
    claimedAt: "2024-12-29T09:00:00",
    releasedAt: "2024-12-29T11:15:00",
    duration: "2h 15m",
  },
];

export default function MyClaims() {
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);

  const handleReleaseClick = (claim: any) => {
    setSelectedClaim(claim);
    setReleaseDialogOpen(true);
  };

  const handleConfirmRelease = () => {
    toast.success(`Successfully released ${selectedClaim.code} - ${selectedClaim.name}!`);
    setReleaseDialogOpen(false);
    setSelectedClaim(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Claims</h1>
          <p className="text-muted-foreground">Manage your active claims and view history</p>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">
              <Clock className="h-4 w-4 mr-2" />
              Active Claims ({mockActiveClaims.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              <TrendingUp className="h-4 w-4 mr-2" />
              Claim History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {mockActiveClaims.length === 0 ? (
              <Card className="p-12 text-center border-border bg-card/50">
                <p className="text-muted-foreground">You don't have any active claims.</p>
              </Card>
            ) : (
              mockActiveClaims.map((claim) => (
                <Card key={claim.id} className="p-6 border-border bg-card/50 border-glow-cyan">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="default" className="font-mono">
                          {claim.code}
                        </Badge>
                        <h3 className="text-lg font-semibold text-foreground">
                          {claim.name}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {claim.city}
                      </p>
                      <div className="pt-2">
                        <CountdownTimer expiresAt={claim.expiresAt} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReleaseClick(claim)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Release Claim
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {mockClaimHistory.map((claim) => (
              <Card key={claim.id} className="p-6 border-border bg-card/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        {claim.code}
                      </Badge>
                      <h3 className="text-lg font-semibold text-foreground">
                        {claim.name}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {claim.city}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                      <span>Duration: {claim.duration}</span>
                      <span>•</span>
                      <span>Claimed: {new Date(claim.claimedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {selectedClaim && (
        <ReleaseDialog
          open={releaseDialogOpen}
          onOpenChange={setReleaseDialogOpen}
          respawnCode={selectedClaim.code}
          respawnName={selectedClaim.name}
          onConfirm={handleConfirmRelease}
        />
      )}
    </DashboardLayout>
  );
}
