import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useGuilds } from "@/hooks/useGuilds";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";

const MasterAdmin = () => {
  const { isMasterAdmin } = useAuth();
  const { users, updateUserRole, assignUserToGuild } = useAdmin();
  const { guilds, createGuild, updateGuild } = useGuilds();
  const queryClient = useQueryClient();
  
  const [newGuildName, setNewGuildName] = useState("");
  const [newGuildWorld, setNewGuildWorld] = useState("");
  const [newGuildDisplayName, setNewGuildDisplayName] = useState("");
  const [newGuildSubtitle, setNewGuildSubtitle] = useState("");

  // Refresh users list whenever guild assignments change
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [queryClient]);

  if (!isMasterAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Access denied. Master admin privileges required.</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleCreateGuild = async () => {
    if (!newGuildName || !newGuildWorld || !newGuildDisplayName) return;
    
    await createGuild.mutateAsync({
      name: newGuildName,
      world: newGuildWorld,
      display_name: newGuildDisplayName,
      subtitle: newGuildSubtitle || undefined,
    });
    
    setNewGuildName("");
    setNewGuildWorld("");
    setNewGuildDisplayName("");
    setNewGuildSubtitle("");
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Master Admin</h1>
          <p className="text-muted-foreground mt-2">
            Manage users, roles, and guilds across the system
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="guilds">Guild Management</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user roles and guild assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Active Character</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Change Role</TableHead>
                      <TableHead>Current Guild</TableHead>
                      <TableHead>Assign Guild</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.activeCharacterName || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'master_admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value) => updateUserRole.mutate({ userId: user.id, newRole: value as any })}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="neutro">Neutro</SelectItem>
                              <SelectItem value="guild">Guild</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="master_admin">Master Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {user.guild_name ? (
                            <span className="text-sm">
                              {user.guild_name}
                              <span className="text-muted-foreground ml-1">({user.guild_world})</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">No guild</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.guild_id || "none"}
                            onValueChange={(value) => assignUserToGuild.mutate({ userId: user.id, guildId: value === "none" ? null : value })}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select guild" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No guild</SelectItem>
                              {guilds?.map((guild) => (
                                <SelectItem key={guild.id} value={guild.id}>
                                  {guild.display_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guilds">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Guild</CardTitle>
                  <CardDescription>
                    Add a new guild to the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="guild-name">Guild Name (Slug)</Label>
                      <Input
                        id="guild-name"
                        placeholder="e.g., genesis-mystian"
                        value={newGuildName}
                        onChange={(e) => setNewGuildName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="guild-world">World</Label>
                      <Input
                        id="guild-world"
                        placeholder="e.g., Mystian"
                        value={newGuildWorld}
                        onChange={(e) => setNewGuildWorld(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="guild-display">Display Name</Label>
                      <Input
                        id="guild-display"
                        placeholder="e.g., Genesis - Mystian"
                        value={newGuildDisplayName}
                        onChange={(e) => setNewGuildDisplayName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="guild-subtitle">Subtitle (Optional)</Label>
                      <Input
                        id="guild-subtitle"
                        placeholder="e.g., Default Guild"
                        value={newGuildSubtitle}
                        onChange={(e) => setNewGuildSubtitle(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleCreateGuild}>Create Guild</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Existing Guilds</CardTitle>
                  <CardDescription>
                    Manage existing guilds in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Display Name</TableHead>
                        <TableHead>World</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Subtitle</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {guilds?.map((guild) => (
                        <TableRow key={guild.id}>
                          <TableCell className="font-medium">{guild.display_name}</TableCell>
                          <TableCell>{guild.world}</TableCell>
                          <TableCell>{guild.name}</TableCell>
                          <TableCell>{guild.subtitle || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MasterAdmin;
