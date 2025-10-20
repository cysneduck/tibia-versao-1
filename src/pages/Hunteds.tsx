import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Target, Search, AlertTriangle } from "lucide-react";
import { useHunteds } from "@/hooks/useHunteds";
import { format } from "date-fns";

export default function Hunteds() {
  const { hunteds, isLoading } = useHunteds();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHunteds = hunteds?.filter(hunted =>
    hunted.character_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading hunted characters...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Hunted Characters</h1>
          <p className="text-muted-foreground">Characters currently being hunted</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search hunted characters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Hunted Characters List */}
        {filteredHunteds && filteredHunteds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHunteds.map((hunted) => (
              <Card key={hunted.id} className="border-border bg-card/50 hover:bg-card/70 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-destructive" />
                      <CardTitle className="text-lg">{hunted.character_name}</CardTitle>
                    </div>
                    <Badge variant="destructive" className="ml-2">
                      Hunted
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {hunted.reason && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">Reason:</p>
                      <p className="text-sm text-foreground">{hunted.reason}</p>
                    </div>
                  )}
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Added on {format(new Date(hunted.created_at), "MMM dd, yyyy 'at' HH:mm")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border bg-card/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="text-xl mb-2">No Hunted Characters</CardTitle>
              <CardDescription className="text-center">
                {searchTerm 
                  ? "No characters match your search." 
                  : "There are no hunted characters at the moment."}
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}