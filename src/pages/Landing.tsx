import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skull, Target, MapPin, Clock, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/landing-hero.png";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Skull className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold glow-cyan">Claimed System</h1>
          </div>
          <Link to="/login">
            <Button variant="outline">Login</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 flex-1">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-5xl font-bold leading-tight">
              Professional{" "}
              <span className="text-primary glow-cyan">Tibia</span>{" "}
              Respawn Management
            </h2>
            <p className="text-xl text-muted-foreground">
              Take control of your guild's hunting grounds with our advanced claim tracking and notification system. Never miss a respawn opportunity again.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="text-lg px-8" asChild>
                <a href="#download">Download Now</a>
              </Button>
              <Button size="lg" variant="outline" className="text-lg" asChild>
                <Link to="/login">Try Web Version</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
            <img 
              src={heroImage} 
              alt="Claimed System Interface" 
              className="relative rounded-lg border border-primary/30 shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 border-t border-border">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">Why Choose Claimed System?</h3>
          <p className="text-muted-foreground text-lg">
            Built by hunters, for hunters. Everything you need in one place.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-card/50 border-border hover:border-primary/50 transition-colors">
            <div className="mb-4">
              <Clock className="h-12 w-12 text-primary" />
            </div>
            <h4 className="text-xl font-bold mb-2">Real-time Tracking</h4>
            <p className="text-muted-foreground">
              Track claim durations with countdown timers and automatic notifications when respawns become available.
            </p>
          </Card>

          <Card className="p-6 bg-card/50 border-border hover:border-primary/50 transition-colors">
            <div className="mb-4">
              <Target className="h-12 w-12 text-primary" />
            </div>
            <h4 className="text-xl font-bold mb-2">Smart Queue System</h4>
            <p className="text-muted-foreground">
              Join queues for popular spawns and get priority notifications when it's your turn to claim.
            </p>
          </Card>

          <Card className="p-6 bg-card/50 border-border hover:border-primary/50 transition-colors">
            <div className="mb-4">
              <Users className="h-12 w-12 text-primary" />
            </div>
            <h4 className="text-xl font-bold mb-2">Guild Management</h4>
            <p className="text-muted-foreground">
              Organize your guild members with role-based permissions and customizable claim durations.
            </p>
          </Card>

          <Card className="p-6 bg-card/50 border-border hover:border-primary/50 transition-colors">
            <div className="mb-4">
              <MapPin className="h-12 w-12 text-primary" />
            </div>
            <h4 className="text-xl font-bold mb-2">Multi-City Support</h4>
            <p className="text-muted-foreground">
              Manage respawns across all major Tibia cities with organized filtering and search.
            </p>
          </Card>

          <Card className="p-6 bg-card/50 border-border hover:border-primary/50 transition-colors">
            <div className="mb-4">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <h4 className="text-xl font-bold mb-2">Hunted List</h4>
            <p className="text-muted-foreground">
              Keep track of enemy players with a dedicated hunted characters system for better spawn control.
            </p>
          </Card>

          <Card className="p-6 bg-card/50 border-border hover:border-primary/50 transition-colors">
            <div className="mb-4">
              <Skull className="h-12 w-12 text-primary" />
            </div>
            <h4 className="text-xl font-bold mb-2">Desktop & Web</h4>
            <p className="text-muted-foreground">
              Available as both a desktop application with native notifications and a web version for on-the-go access.
            </p>
          </Card>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="container mx-auto px-4 py-16 border-t border-border">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h3 className="text-3xl font-bold">Download Claimed System</h3>
          <p className="text-muted-foreground text-lg">
            Get the desktop application for the best experience with native notifications and system tray integration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg">
              Download for Windows
            </Button>
            <Button size="lg" variant="outline" className="text-lg">
              Download for macOS
            </Button>
            <Button size="lg" variant="outline" className="text-lg">
              Download for Linux
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Or use the{" "}
            <Link to="/login" className="text-primary hover:underline">
              web version
            </Link>{" "}
            directly in your browser
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Claimed System. Built for the Tibia community.</p>
        </div>
      </footer>
    </div>
  );
}
