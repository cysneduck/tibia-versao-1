import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Clock, Users, MapPin } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn={false} />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-primary glow-cyan">
            Tibia Claim
          </h1>
          <p className="text-xl md:text-2xl text-foreground max-w-3xl mx-auto">
            The Ultimate Guild Respawn Management System
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Streamline your guild's hunting ground coordination with our powerful claim system. 
            Keep track of who's hunting where, prevent conflicts, and maximize your team's efficiency.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground glow-cyan">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-glow-cyan bg-card/80">
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Guild Priority</CardTitle>
              <CardDescription>
                Guild members get 2h 15min claims, while Neutros get 1h 15min
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-glow-cyan bg-card/80">
            <CardHeader>
              <Clock className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Real-time Tracking</CardTitle>
              <CardDescription>
                See exactly when respawns become available with live countdown timers
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-glow-cyan bg-card/80">
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Team Coordination</CardTitle>
              <CardDescription>
                Know who's hunting where and avoid conflicts with your guildmates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-glow-cyan bg-card/80">
            <CardHeader>
              <MapPin className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Complete Coverage</CardTitle>
              <CardDescription>
                Track respawns across all major hunting grounds and cities in Tibia
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-primary glow-cyan mb-8">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-card/80">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <CardTitle>Login</CardTitle>
                <CardContent className="px-0">
                  <p className="text-muted-foreground">
                    Create your account and join your guild's claim system
                  </p>
                </CardContent>
              </CardHeader>
            </Card>

            <Card className="bg-card/80">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <CardTitle>Claim</CardTitle>
                <CardContent className="px-0">
                  <p className="text-muted-foreground">
                    Browse available respawns and claim the one you want to hunt
                  </p>
                </CardContent>
              </CardHeader>
            </Card>

            <Card className="bg-card/80">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <CardTitle>Hunt</CardTitle>
                <CardContent className="px-0">
                  <p className="text-muted-foreground">
                    Hunt in peace knowing your spot is reserved and tracked
                  </p>
                </CardContent>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-12 px-6 rounded-lg border border-glow-cyan bg-card/50">
          <h2 className="text-3xl font-bold text-primary glow-cyan mb-4">
            Ready to Organize Your Guild?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join guilds already using Tibia Claim to manage their hunting grounds more efficiently
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground glow-cyan">
            Create Your Account
          </Button>
        </div>
      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Tibia Claim - Empowering guilds to manage respawns efficiently</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
