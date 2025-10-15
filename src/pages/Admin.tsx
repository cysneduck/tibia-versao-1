import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Users, MapPin, TrendingUp, MoreVertical, UserPlus } from "lucide-react";

interface User {
  id: string;
  characters: string[];
  email: string;
  userType: "guild" | "neutro";
  status: "active" | "inactive";
}

export default function Admin() {
  const [guildHours, setGuildHours] = useState("2");
  const [guildMinutes, setGuildMinutes] = useState("15");
  const [neutroHours, setNeutroHours] = useState("1");
  const [neutroMinutes, setNeutroMinutes] = useState("15");

  const [users] = useState<User[]>([
    { id: "1", characters: ["Dark Knight"], email: "dk@resonance.com", userType: "guild", status: "active" },
    { id: "2", characters: ["Shadow Paladin", "Thunder Mage"], email: "sp@resonance.com", userType: "neutro", status: "active" },
    { id: "3", characters: ["Mystic Sorcerer"], email: "ms@resonance.com", userType: "guild", status: "active" },
    { id: "4", characters: ["Dragon Slayer"], email: "ds@resonance.com", userType: "guild", status: "inactive" },
  ]);

  // Mock statistics
  const stats = {
    totalUsers: users.length,
    activeClaims: 4,
    availableRespawns: 15,
    guildMembers: users.filter(u => u.userType === "guild").length,
    neutroUsers: users.filter(u => u.userType === "neutro").length,
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Claim duration settings updated successfully!");
  };

  const handleChangeUserType = (userId: string, newType: "guild" | "neutro") => {
    const user = users.find(u => u.id === userId);
    toast.success(`${user?.characters[0]}'s user type changed to ${newType === "guild" ? "Guild Member" : "Neutro"}`);
  };

  const handleDeactivateUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    toast.success(`${user?.characters[0]} has been ${user?.status === "active" ? "deactivated" : "activated"}`);
  };

  const handleRemoveUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    toast.success(`${user?.characters[0]} has been removed from the system`);
  };

  return (
    <DashboardLayout isAdmin>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage system settings and users</p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-border bg-card/50">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                Total Users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
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
              <p className="text-3xl font-bold text-primary">{stats.activeClaims}</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{stats.availableRespawns}</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardHeader className="pb-3">
              <CardDescription className="text-muted-foreground">
                Guild Members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{stats.guildMembers}</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardHeader className="pb-3">
              <CardDescription className="text-muted-foreground">
                Neutro Users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-secondary">{stats.neutroUsers}</p>
            </CardContent>
          </Card>
        </div>

        {/* System Variables */}
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle>Claim Duration Settings</CardTitle>
            <CardDescription>Configure default claim durations for different user types</CardDescription>
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
                      />
                      <span className="text-sm text-muted-foreground">minutes</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit">Save Settings</Button>
            </form>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card className="border-border bg-card/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </div>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invite New User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Character(s)</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.characters.join(", ")}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.userType === "guild"
                            ? "border-primary text-primary"
                            : "border-secondary text-secondary"
                        }
                      >
                        {user.userType === "guild" ? "Guild" : "Neutro"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.status === "active" ? "default" : "secondary"}
                        className={
                          user.status === "active"
                            ? "bg-success/20 text-success border-success"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleChangeUserType(
                                user.id,
                                user.userType === "guild" ? "neutro" : "guild"
                              )
                            }
                          >
                            Change to {user.userType === "guild" ? "Neutro" : "Guild Member"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeactivateUser(user.id)}>
                            {user.status === "active" ? "Deactivate" : "Activate"} User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRemoveUser(user.id)}
                            className="text-destructive"
                          >
                            Remove User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
