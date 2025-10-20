import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle } from "lucide-react";
import { useHunteds } from "@/hooks/useHunteds";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
          <Card className="border-border bg-card/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Character Name</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Added By</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHunteds.map((hunted) => (
                  <TableRow key={hunted.id}>
                    <TableCell className="font-medium">{hunted.character_name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {hunted.reason || <span className="text-muted-foreground italic">No reason provided</span>}
                    </TableCell>
                    <TableCell>
                      {hunted.added_by_character_name || <span className="text-muted-foreground italic">Unknown</span>}
                    </TableCell>
                    <TableCell>
                      {format(new Date(hunted.created_at), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="destructive">Hunted</Badge>
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