import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MapPin, TrendingUp, TicketIcon, Trash2, Clock } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { useHunteds } from "@/hooks/useHunteds";
import { useAdminTickets } from "@/hooks/useAdminTickets";
import { AdminTicketDialog } from "@/components/AdminTicketDialog";
import { format } from "date-fns";

export default function Admin() {
  const { settings, stats, isLoading, updateSystemSetting } = useAdmin();
  const { hunteds, addHunted, removeHunted } = useHunteds();
  const { tickets: adminTickets, stats: ticketStats } = useAdminTickets();

  const [guildHours, setGuildHours] = useState(settings?.guild_claim_hours ?? "2");
  const [guildMinutes, setGuildMinutes] = useState(settings?.guild_claim_minutes ?? "30");
  const [neutroHours, setNeutroHours] = useState(settings?.neutro_claim_hours ?? "1");
  const [neutroMinutes, setNeutroMinutes] = useState(settings?.neutro_claim_minutes ?? "15");
  
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketFilter, setTicketFilter] = useState<string>("all");
  
  // Sync state with settings when they load
  useEffect(() => {
    if (settings) {
      setGuildHours(settings.guild_claim_hours ?? "2");
      setGuildMinutes(settings.guild_claim_minutes ?? "30");
      setNeutroHours(settings.neutro_claim_hours ?? "1");
      setNeutroMinutes(settings.neutro_claim_minutes ?? "15");
    }
  }, [settings]);
  
  const [huntedName, setHuntedName] = useState("");
  const [huntedReason, setHuntedReason] = useState("");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateSystemSetting.mutate({ key: "guild_claim_hours", value: guildHours });
    updateSystemSetting.mutate({ key: "guild_claim_minutes", value: guildMinutes });
    updateSystemSetting.mutate({ key: "neutro_claim_hours", value: neutroHours });
    updateSystemSetting.mutate({ key: "neutro_claim_minutes", value: neutroMinutes });
  };

  const handleAddHunted = (e: React.FormEvent) => {
    e.preventDefault();
    if (!huntedName.trim()) return;
    
    addHunted.mutate(
      { character_name: huntedName.trim(), reason: huntedReason.trim() || undefined },
      {
        onSuccess: () => {
          setHuntedName("");
          setHuntedReason("");
        }
      }
    );
  };

  const handleRemoveHunted = (huntedId: string) => {
    removeHunted.mutate(huntedId);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage claim durations, hunted characters, and support tickets
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="claim-duration">Claim Duration</TabsTrigger>
            <TabsTrigger value="hunteds">Hunted Characters</TabsTrigger>
            <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border bg-card/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
                  <p className="text-xs text-muted-foreground">Registered accounts</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Claims</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeClaims ?? 0}</div>
                  <p className="text-xs text-muted-foreground">Currently active</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Respawns</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalRespawns ?? 0}</div>
                  <p className="text-xs text-muted-foreground">Available respawns</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
                  <TicketIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ticketStats?.total ?? 0}</div>
                  <p className="text-xs text-muted-foreground">{ticketStats?.open ?? 0} open tickets</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Claim Duration Tab */}
          <TabsContent value="claim-duration">
            <Card className="border-border bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Claim Duration Settings
                </CardTitle>
                <CardDescription>
                  Configure how long users can hold claims based on their role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h3 className="font-semibold mb-4 text-lg">Guild Members Duration</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="guildHours">Hours</Label>
                          <Input
                            id="guildHours"
                            type="number"
                            min="0"
                            max="24"
                            value={guildHours}
                            onChange={(e) => setGuildHours(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guildMinutes">Minutes</Label>
                          <Input
                            id="guildMinutes"
                            type="number"
                            min="0"
                            max="59"
                            value={guildMinutes}
                            onChange={(e) => setGuildMinutes(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50">
                      <h3 className="font-semibold mb-4 text-lg">Neutro Users Duration</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="neutroHours">Hours</Label>
                          <Input
                            id="neutroHours"
                            type="number"
                            min="0"
                            max="24"
                            value={neutroHours}
                            onChange={(e) => setNeutroHours(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="neutroMinutes">Minutes</Label>
                          <Input
                            id="neutroMinutes"
                            type="number"
                            min="0"
                            max="59"
                            value={neutroMinutes}
                            onChange={(e) => setNeutroMinutes(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={updateSystemSetting.isPending}>
                    {updateSystemSetting.isPending ? "Saving..." : "Save Settings"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hunted Characters Tab */}
          <TabsContent value="hunteds">
            <Card className="border-border bg-card/50">
              <CardHeader>
                <CardTitle>Hunted Characters Management</CardTitle>
                <CardDescription>
                  Add or remove characters from the hunted list
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Hunted Form */}
                <form onSubmit={handleAddHunted} className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="huntedName">Character Name *</Label>
                      <Input
                        id="huntedName"
                        placeholder="Enter character name"
                        value={huntedName}
                        onChange={(e) => setHuntedName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="huntedReason">Reason (Optional)</Label>
                      <Textarea
                        id="huntedReason"
                        placeholder="Why is this character hunted?"
                        value={huntedReason}
                        onChange={(e) => setHuntedReason(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={addHunted.isPending || !huntedName.trim()}>
                    Add to Hunted List
                  </Button>
                </form>

                {/* Hunted Characters Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Character Name</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Added On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hunteds && hunteds.length > 0 ? (
                        hunteds.map((hunted) => (
                          <TableRow key={hunted.id}>
                            <TableCell className="font-medium">{hunted.character_name}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {hunted.reason || "No reason provided"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {format(new Date(hunted.created_at), "MMM dd, yyyy HH:mm")}
                            </TableCell>
                            <TableCell className="text-right">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove from hunted list?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove {hunted.character_name} from the hunted list?
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRemoveHunted(hunted.id)}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No hunted characters yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets">
            <Card className="border-border bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TicketIcon className="h-5 w-5" />
                  Support Tickets Management
                </CardTitle>
                <CardDescription>
                  Manage and resolve user support tickets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Ticket Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Total Tickets</p>
                    <p className="text-2xl font-bold">{ticketStats?.total || 0}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-sm text-muted-foreground">Open</p>
                    <p className="text-2xl font-bold text-yellow-500">{ticketStats?.open || 0}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold text-blue-500">{ticketStats?.inProgress || 0}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-sm text-muted-foreground">Resolved</p>
                    <p className="text-2xl font-bold text-green-500">{ticketStats?.resolved || 0}</p>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                  <Button
                    variant={ticketFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTicketFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={ticketFilter === "open" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTicketFilter("open")}
                  >
                    Open
                  </Button>
                  <Button
                    variant={ticketFilter === "in_progress" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTicketFilter("in_progress")}
                  >
                    In Progress
                  </Button>
                  <Button
                    variant={ticketFilter === "resolved" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTicketFilter("resolved")}
                  >
                    Resolved
                  </Button>
                </div>

                {/* Tickets Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminTickets && adminTickets.length > 0 ? (
                        adminTickets
                          .filter(ticket => ticketFilter === "all" || ticket.status === ticketFilter)
                          .map((ticket) => (
                            <TableRow key={ticket.id}>
                              <TableCell className="font-medium">
                                {ticket.profiles.email}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {ticket.title}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {ticket.category}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {ticket.priority}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    ticket.status === 'open' ? 'default' :
                                    ticket.status === 'in_progress' ? 'secondary' :
                                    'outline'
                                  }
                                >
                                  {ticket.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {format(new Date(ticket.created_at), "MMM dd, yyyy")}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedTicket(ticket)}
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            No tickets found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Admin Ticket Dialog */}
        {selectedTicket && (
          <AdminTicketDialog
            ticket={selectedTicket}
            open={!!selectedTicket}
            onOpenChange={(open) => !open && setSelectedTicket(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
