import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle, Activity } from "lucide-react";
import { useHunteds } from "@/hooks/useHunteds";
import { format, formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Hunteds() {
  const { hunteds, isLoading } = useHunteds();
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  const filteredHunteds = hunteds
    ?.filter(hunted => 
      hunted.character_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    ?.filter(hunted => 
      !showOnlineOnly || hunted.is_online
    )
    ?.sort((a, b) => {
      // Sort by online status first (online first)
      if (a.is_online && !b.is_online) return -1;
      if (!a.is_online && b.is_online) return 1;
      // Then by last seen online
      if (a.last_seen_online && b.last_seen_online) {
        return new Date(b.last_seen_online).getTime() - new Date(a.last_seen_online).getTime();
      }
      return 0;
    });

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

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search hunted characters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="online-only"
              checked={showOnlineOnly}
              onCheckedChange={setShowOnlineOnly}
            />
            <Label htmlFor="online-only" className="cursor-pointer whitespace-nowrap">
              <Activity className="inline h-4 w-4 mr-1 text-success" />
              Online Only
            </Label>
          </div>
        </div>

        {/* Hunted Characters List */}
        {filteredHunteds && filteredHunteds.length > 0 ? (
          <Card className="border-border bg-card/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Character Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Added By</TableHead>
                  <TableHead>Date Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHunteds.map((hunted) => (
                  <TableRow 
                    key={hunted.id}
                    className={hunted.is_online ? "bg-success/5" : ""}
                  >
                    <TableCell className="font-medium">{hunted.character_name}</TableCell>
                    <TableCell>
                      {hunted.is_online ? (
                        <Badge variant="default" className="bg-success text-success-foreground">
                          <Activity className="h-3 w-3 mr-1 animate-pulse" />
                          Online
                        </Badge>
                      ) : hunted.last_checked ? (
                        <Badge variant="secondary">
                          Offline
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Unknown
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {hunted.last_seen_online ? (
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(hunted.last_seen_online), { addSuffix: true })}
                        </span>
                      ) : hunted.last_checked ? (
                        <span className="text-muted-foreground italic">Never seen online</span>
                      ) : (
                        <span className="text-muted-foreground italic">Not checked yet</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {hunted.reason || <span className="text-muted-foreground italic">No reason provided</span>}
                    </TableCell>
                    <TableCell>
                      {hunted.added_by_character_name || <span className="text-muted-foreground italic">Unknown</span>}
                    </TableCell>
                    <TableCell>
                      {format(new Date(hunted.created_at), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
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