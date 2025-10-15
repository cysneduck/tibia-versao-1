import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export default function Profile() {
  const { user, userRole } = useAuth();
  const {
    profile,
    characters,
    isLoading,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    setActiveCharacter,
    updateProfile,
  } = useProfile(user?.id);

  const [newCharName, setNewCharName] = useState("");
  const [newCharLevel, setNewCharLevel] = useState("");
  const [newCharVocation, setNewCharVocation] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSaveNotifications = (field: "email_notifications" | "claim_reminders", value: boolean) => {
    updateProfile.mutate({ [field]: value });
  };

  const handleSetActive = (characterId: string) => {
    setActiveCharacter.mutate(characterId);
  };

  const handleRemoveCharacter = (characterId: string) => {
    const char = characters?.find((c) => c.id === characterId);
    if (char?.id === profile?.active_character_id && characters && characters.length > 1) {
      // Cannot remove active character
      return;
    }
    deleteCharacter.mutate(characterId);
  };

  const handleAddCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharName.trim()) return;

    addCharacter.mutate(
      {
        name: newCharName,
        level: newCharLevel ? parseInt(newCharLevel) : undefined,
        vocation: newCharVocation || undefined,
      },
      {
        onSuccess: () => {
          setNewCharName("");
          setNewCharLevel("");
          setNewCharVocation("");
          setShowAddForm(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  const userTypeDuration = userRole === "guild" ? "2 hours 15 minutes" : "1 hour 15 minutes";

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your characters and preferences</p>
        </div>

        {/* Characters Management */}
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle>My Characters</CardTitle>
            <CardDescription>
              Manage your Tibia characters. The active character will be used when claiming respawns.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {characters?.map((char) => (
              <div
                key={char.id}
                className={`p-4 rounded-lg border transition-all ${
                  char.id === profile?.active_character_id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card/30"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {char.id === profile?.active_character_id && (
                        <Star className="h-4 w-4 text-primary fill-primary" />
                      )}
                      <h4 className="font-semibold text-foreground">{char.name}</h4>
                      {char.id === profile?.active_character_id && (
                        <Badge variant="outline" className="border-primary text-primary text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    {(char.level || char.vocation) && (
                      <p className="text-sm text-muted-foreground">
                        {char.level && `Level ${char.level}`}
                        {char.level && char.vocation && " • "}
                        {char.vocation && char.vocation}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {char.id !== profile?.active_character_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetActive(char.id)}
                        className="text-xs"
                      >
                        Set as Active
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCharacter(char.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {showAddForm ? (
              <form onSubmit={handleAddCharacter} className="p-4 rounded-lg border border-border bg-card/30 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="newCharName">Character Name *</Label>
                  <Input
                    id="newCharName"
                    value={newCharName}
                    onChange={(e) => setNewCharName(e.target.value)}
                    placeholder="Enter character name"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="newCharLevel">Level (optional)</Label>
                    <Input
                      id="newCharLevel"
                      type="number"
                      value={newCharLevel}
                      onChange={(e) => setNewCharLevel(e.target.value)}
                      placeholder="e.g., 500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newCharVocation">Vocation (optional)</Label>
                    <Select value={newCharVocation} onValueChange={setNewCharVocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EK">Elite Knight</SelectItem>
                        <SelectItem value="RP">Royal Paladin</SelectItem>
                        <SelectItem value="ED">Elder Druid</SelectItem>
                        <SelectItem value="MS">Master Sorcerer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={addCharacter.isPending}>
                    Add Character
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Character
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your profile details and membership</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>User Type</Label>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      userRole === "guild" ? "border-primary text-primary" : "border-secondary text-secondary"
                    }
                  >
                    {userRole === "guild" ? "Guild Member" : userRole === "admin" ? "Admin" : "Neutro"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Claim Duration</Label>
                <p className="text-sm text-muted-foreground">{userTypeDuration} per respawn</p>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates about respawn activity</p>
              </div>
              <Switch
                checked={profile?.email_notifications ?? true}
                onCheckedChange={(value) => handleSaveNotifications("email_notifications", value)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Claim Reminders</Label>
                <p className="text-sm text-muted-foreground">Get notified when your claims are about to expire</p>
              </div>
              <Switch
                checked={profile?.claim_reminders ?? true}
                onCheckedChange={(value) => handleSaveNotifications("claim_reminders", value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
