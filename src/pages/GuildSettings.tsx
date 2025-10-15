import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Users, Shield, CreditCard, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const mockMembers = [
  { id: "1", characterName: "Knight Hunter", email: "knight@tibia.com", userType: "guild", joinedAt: "2024-01-15" },
  { id: "2", characterName: "Dragon Slayer", email: "dragon@tibia.com", userType: "guild", joinedAt: "2024-01-20" },
  { id: "3", characterName: "Paladin Pro", email: "paladin@tibia.com", userType: "guild", joinedAt: "2024-02-01" },
  { id: "4", characterName: "Mage Master", email: "mage@tibia.com", userType: "neutro", joinedAt: "2024-02-10" },
];

export default function GuildSettings() {
  const copyAccessCode = () => {
    navigator.clipboard.writeText("ELITE-KNIGHTS-2024");
    toast.success("Access code copied to clipboard!");
  };

  const generateNewCode = () => {
    toast.success("New access code generated!");
  };

  return (
    <DashboardLayout isAdmin>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Guild Settings</h1>
          <p className="text-muted-foreground">Manage your guild and members</p>
        </div>

        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Guild Information
            </CardTitle>
            <CardDescription>Basic details about your guild</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Guild Name</Label>
                <p className="text-foreground font-medium">Elite Knights</p>
              </div>

              <div className="space-y-2">
                <Label>Total Members</Label>
                <p className="text-foreground font-medium">{mockMembers.length}</p>
              </div>

              <div className="space-y-2">
                <Label>Guild Members</Label>
                <p className="text-foreground font-medium">
                  {mockMembers.filter(m => m.userType === "guild").length}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Neutros</Label>
                <p className="text-foreground font-medium">
                  {mockMembers.filter(m => m.userType === "neutro").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Subscription Status
            </CardTitle>
            <CardDescription>Your guild's subscription information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Current Plan</p>
                <p className="text-sm text-muted-foreground">Monthly Subscription</p>
              </div>
              <Badge className="bg-success text-white">Active</Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Next billing date: January 15, 2025</p>
              <p className="text-sm text-muted-foreground">Price: $9.99/month</p>
            </div>

            <Button variant="outline" className="w-full">
              Manage Subscription
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle>Guild Access Code</CardTitle>
            <CardDescription>Share this code with new members to join your guild</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value="ELITE-KNIGHTS-2024" readOnly className="font-mono" />
              <Button variant="outline" size="icon" onClick={copyAccessCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="outline" onClick={generateNewCode}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate New Code
            </Button>

            <p className="text-xs text-muted-foreground">
              Note: Generating a new code will invalidate the current one.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Guild Members
            </CardTitle>
            <CardDescription>Manage your guild members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Character Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.characterName}</TableCell>
                      <TableCell className="text-muted-foreground">{member.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            member.userType === "guild"
                              ? "border-primary text-primary"
                              : "border-secondary text-secondary"
                          }
                        >
                          {member.userType === "guild" ? "Guild" : "Neutro"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
