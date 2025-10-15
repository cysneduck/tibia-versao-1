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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, MapPin, TrendingUp } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";

export default function Admin() {
  const { users, settings, stats, isLoading, updateUserRole, updateSystemSetting } = useAdmin();

  const [guildHours, setGuildHours] = useState(settings?.guild_claim_hours || "2");
  const [guildMinutes, setGuildMinutes] = useState(settings?.guild_claim_minutes || "15");
  const [neutroHours, setNeutroHours] = useState(settings?.neutro_claim_hours || "1");
  const [neutroMinutes, setNeutroMinutes] = useState(settings?.neutro_claim_minutes || "15");

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

  if (isLoading) {
    return (
      <DashboardLayout isAdmin>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout isAdmin>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage system settings and users</p>
        </div>

        {/* Statistics Overview */}
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

              <Button type="submit" disabled={updateSystemSetting.isPending}>
                Save Settings
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Change Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.role === "admin"
                            ? "border-purple-500 text-purple-500"
                            : user.role === "guild"
                            ? "border-primary text-primary"
                            : "border-secondary text-secondary"
                        }
                      >
                        {user.role === "admin" ? "Admin" : user.role === "guild" ? "Guild" : "Neutro"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleChangeUserRole(user.id, value)}
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
