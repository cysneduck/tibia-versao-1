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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Users, MapPin, TrendingUp, Target, Trash2, Search, ChevronLeft, ChevronRight, TicketIcon, Clock, ArrowLeft, ChevronRight as ChevronRightIcon, Building, Shield } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useHunteds } from "@/hooks/useHunteds";
import { useAdminTickets } from "@/hooks/useAdminTickets";
import { useGuilds } from "@/hooks/useGuilds";
import { AdminTicketDialog } from "@/components/AdminTicketDialog";
import { format } from "date-fns";

type AdminSection = 'dashboard' | 'claim-duration' | 'hunteds' | 'tickets' | 'master' | 'respawns';

export default function Admin() {
  const { users, settings, stats, isLoading, updateUserRole, assignUserToGuild, updateSystemSetting } = useAdmin();
  const { isMasterAdmin } = useAuth();
  const { hunteds, addHunted, removeHunted } = useHunteds();
  const { tickets: adminTickets, stats: ticketStats } = useAdminTickets();
  const { guilds, createGuild } = useGuilds();

  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
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
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildWorld, setNewGuildWorld] = useState('');
  const [newGuildDisplayName, setNewGuildDisplayName] = useState('');
  const [newGuildSubtitle, setNewGuildSubtitle] = useState('');
  
  const [userSearch, setUserSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateSystemSetting.mutate({ key: "guild_claim_hours", value: guildHours });
    updateSystemSetting.mutate({ key: "guild_claim_minutes", value: guildMinutes });
    updateSystemSetting.mutate({ key: "neutro_claim_hours", value: neutroHours });
    updateSystemSetting.mutate({ key: "neutro_claim_minutes", value: neutroMinutes });
  };

  const handleChangeUserRole = (userId: string, newRole: string) => {
    updateUserRole.mutate({ userId, newRole });
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

  const handleRemoveHunted = (id: string) => {
    removeHunted.mutate(id);
  };

  // Filter and paginate users
  const filteredUsers = users?.filter((user: any) => {
    const searchLower = userSearch.toLowerCase();
    const emailMatch = user.email?.toLowerCase().includes(searchLower);
    const characterMatch = user.activeCharacterName?.toLowerCase().includes(searchLower);
    return emailMatch || characterMatch;
  }) || [];

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setUserSearch(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <DashboardLayout isAdmin>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </DashboardLayout>
    );
  }

  const renderBackButton = () => (
    <Button
      variant="ghost"
      onClick={() => setActiveSection('dashboard')}
      className="mb-4"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back to Dashboard
    </Button>
  );

  return (
    <DashboardLayout isAdmin>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage system settings and users</p>
        </div>

        {/* Statistics Overview - Always visible */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border bg-card/50">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                Total Users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{stats?.totalUsers || 0}</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Active Claims
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{stats?.activeClaims || 0}</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Total Respawns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{stats?.totalRespawns || 0}</p>
              </CardContent>
            </Card>
          </div>

        {/* Dashboard View - Navigation Cards */}
        {activeSection === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Claim Duration Settings Card */}
            <Card 
              className="cursor-pointer hover:border-primary transition-colors border-border bg-card/50"
              onClick={() => setActiveSection('claim-duration')}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Claim Duration Settings</CardTitle>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Guild: {guildHours}h {guildMinutes}m | Neutro: {neutroHours}h {neutroMinutes}m
                </p>
              </CardContent>
            </Card>

            {/* Hunted Characters Card */}
            <Card 
              className="cursor-pointer hover:border-primary transition-colors border-border bg-card/50"
              onClick={() => setActiveSection('hunteds')}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Hunted Characters</CardTitle>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {hunteds?.length || 0} characters on the hunted list
                </p>
              </CardContent>
            </Card>

            {/* Support Tickets Card */}
            <Card 
              className="cursor-pointer hover:border-primary transition-colors border-border bg-card/50"
              onClick={() => setActiveSection('tickets')}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TicketIcon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Support Tickets</CardTitle>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {ticketStats?.open || 0} open | {ticketStats?.inProgress || 0} in progress | {ticketStats?.resolved || 0} resolved
                </p>
              </CardContent>
            </Card>

            {/* Master Admin Panel - Master Admin Only */}
            {isMasterAdmin && (
              <Card 
                className="cursor-pointer hover:border-primary transition-colors border-border bg-card/50"
                onClick={() => setActiveSection('master')}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Master Admin</CardTitle>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Manage users, guilds, and system permissions
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Claim Duration Settings Section */}
        {activeSection === 'claim-duration' && (
          <>
            {renderBackButton()}
            <Card className="border-border bg-card/50">
              <CardHeader>
                <CardTitle>Claim Duration Settings</CardTitle>
                <CardDescription>
                  Configure default claim durations for different user types
                  {!isMasterAdmin && (
                    <span className="block mt-1 text-yellow-500">
                      ⚠️ Only Master Admins can modify these settings
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Guild Member Duration</Label>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="23"
                            value={guildHours}
                            onChange={(e) => setGuildHours(e.target.value)}
                            className="w-20"
                            disabled={!isMasterAdmin}
                          />
                          <span className="text-sm text-muted-foreground">hours</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            value={guildMinutes}
                            onChange={(e) => setGuildMinutes(e.target.value)}
                            className="w-20"
                            disabled={!isMasterAdmin}
                          />
                          <span className="text-sm text-muted-foreground">minutes</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Neutro Duration</Label>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="23"
                            value={neutroHours}
                            onChange={(e) => setNeutroHours(e.target.value)}
                            className="w-20"
                            disabled={!isMasterAdmin}
                          />
                          <span className="text-sm text-muted-foreground">hours</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            value={neutroMinutes}
                            onChange={(e) => setNeutroMinutes(e.target.value)}
                            className="w-20"
                            disabled={!isMasterAdmin}
                          />
                          <span className="text-sm text-muted-foreground">minutes</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={updateSystemSetting.isPending || !isMasterAdmin}>
                    Save Settings
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}

        {/* Hunted Characters Management Section */}
        {activeSection === 'hunteds' && (
          <>
            {renderBackButton()}
            <Card className="border-border bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Hunted Characters Management
                </CardTitle>
                <CardDescription>
                  Add or remove characters from the hunted list
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Hunted Form */}
                <form onSubmit={handleAddHunted} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        rows={1}
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
          </>
        )}

        {/* Ticket Management Section */}
        {activeSection === 'tickets' && (
          <>
            {renderBackButton()}
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
                                <Badge variant="outline" className={
                                  ticket.category === 'bug' ? 'border-red-500 text-red-500' :
                                  ticket.category === 'suggestion' ? 'border-blue-500 text-blue-500' :
                                  ticket.category === 'ks_report' ? 'border-orange-500 text-orange-500' :
                                  'border-gray-500 text-gray-500'
                                }>
                                  {ticket.category}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={
                                  ticket.priority === 'urgent' ? 'border-red-500 text-red-500' :
                                  ticket.priority === 'high' ? 'border-orange-500 text-orange-500' :
                                  ticket.priority === 'medium' ? 'border-yellow-500 text-yellow-500' :
                                  'border-gray-500 text-gray-500'
                                }>
                                  {ticket.priority}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={
                                  ticket.status === 'open' ? 'border-yellow-500 text-yellow-500' :
                                  ticket.status === 'in_progress' ? 'border-blue-500 text-blue-500' :
                                  ticket.status === 'resolved' ? 'border-green-500 text-green-500' :
                                  'border-gray-500 text-gray-500'
                                }>
                                  {ticket.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {format(new Date(ticket.created_at), "MMM dd, HH:mm")}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
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
                            No tickets yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Master Admin Section - Master Admin Only */}
        {activeSection === 'master' && isMasterAdmin && (
          <>
            {renderBackButton()}
            <Card className="border-border bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Master Admin Panel
                </CardTitle>
                <CardDescription>
                  Manage users, guilds, and system permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="users" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="users">User Management</TabsTrigger>
                    <TabsTrigger value="guilds">Guild Management</TabsTrigger>
                  </TabsList>

                  {/* User Management Tab */}
                  <TabsContent value="users" className="space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by email or character name..."
                        value={userSearch}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Users Table */}
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Active Character</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Guild</TableHead>
                            <TableHead>Current Role</TableHead>
                            <TableHead>Change Role</TableHead>
                            <TableHead>Assign Guild</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedUsers.length > 0 ? (
                            paginatedUsers.map((user: any) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-medium text-muted-foreground">
                                  {user.activeCharacterName || 'No character'}
                                </TableCell>
                                <TableCell className="font-medium">{user.email}</TableCell>
                                <TableCell>
                                  {user.guild_name && user.guild_world ? (
                                    <span className="text-sm">
                                      {user.guild_name} - {user.guild_world}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">No guild</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={
                                      user.role === "master_admin"
                                        ? "border-red-500 text-red-500"
                                        : user.role === "admin"
                                        ? "border-purple-500 text-purple-500"
                                        : user.role === "guild"
                                        ? "border-primary text-primary"
                                        : "border-secondary text-secondary"
                                    }
                                  >
                                    {user.role === "master_admin" 
                                      ? "Master Admin" 
                                      : user.role === "admin" 
                                      ? "Admin" 
                                      : user.role === "guild" 
                                      ? "Guild" 
                                      : "Neutro"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={user.role}
                                    onValueChange={(value) => handleChangeUserRole(user.id, value)}
                                    disabled={user.role === "master_admin"}
                                  >
                                    <SelectTrigger className="w-[140px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      <SelectItem value="guild">Guild</SelectItem>
                                      <SelectItem value="neutro">Neutro</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={user.guild_id || ''}
                                    onValueChange={(guildId) => assignUserToGuild.mutate({ userId: user.id, guildId })}
                                  >
                                    <SelectTrigger className="w-[180px]">
                                      <SelectValue placeholder="Select guild" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {guilds?.map((guild) => (
                                        <SelectItem key={guild.id} value={guild.id}>
                                          {guild.name} - {guild.world}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                No users found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Showing {startIndex + 1} to {Math.min(startIndex + usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-medium">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Guild Management Tab */}
                  <TabsContent value="guilds" className="space-y-6">
                    {/* Create New Guild Form */}
                    <div className="border border-border rounded-lg p-4 space-y-4">
                      <h3 className="text-lg font-semibold">Create New Guild</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="guild-name">Guild Name</Label>
                          <Input
                            id="guild-name"
                            placeholder="e.g., Genesis"
                            value={newGuildName}
                            onChange={(e) => setNewGuildName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guild-world">World</Label>
                          <Input
                            id="guild-world"
                            placeholder="e.g., Mystian"
                            value={newGuildWorld}
                            onChange={(e) => setNewGuildWorld(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="guild-display-name">Display Name</Label>
                        <Input
                          id="guild-display-name"
                          placeholder="e.g., Genesis Claimed System"
                          value={newGuildDisplayName}
                          onChange={(e) => setNewGuildDisplayName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="guild-subtitle">Subtitle (Optional)</Label>
                        <Input
                          id="guild-subtitle"
                          placeholder="e.g., Professional respawn coordination - Mystian"
                          value={newGuildSubtitle}
                          onChange={(e) => setNewGuildSubtitle(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={() => {
                          if (!newGuildName || !newGuildWorld || !newGuildDisplayName) {
                            return;
                          }
                          createGuild.mutate({
                            name: newGuildName,
                            world: newGuildWorld,
                            display_name: newGuildDisplayName,
                            subtitle: newGuildSubtitle || undefined,
                          });
                          setNewGuildName('');
                          setNewGuildWorld('');
                          setNewGuildDisplayName('');
                          setNewGuildSubtitle('');
                        }}
                        className="w-full"
                        disabled={!newGuildName || !newGuildWorld || !newGuildDisplayName}
                      >
                        Create Guild
                      </Button>
                    </div>

                    {/* Existing Guilds List */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Existing Guilds</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>World</TableHead>
                            <TableHead>Display Name</TableHead>
                            <TableHead>Subtitle</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {guilds?.map((guild: any) => (
                            <TableRow key={guild.id}>
                              <TableCell className="font-medium">{guild.name}</TableCell>
                              <TableCell>{guild.world}</TableCell>
                              <TableCell>{guild.display_name}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {guild.subtitle || 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}

        {/* Admin Ticket Dialog */}
        <AdminTicketDialog
          ticket={selectedTicket}
          open={!!selectedTicket}
          onOpenChange={(open) => !open && setSelectedTicket(null)}
        />
      </div>
    </DashboardLayout>
  );
}
