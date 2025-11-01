import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NotificationPanel } from "./NotificationPanel";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useGuild } from "@/hooks/useGuild";

interface HeaderProps {
  isLoggedIn?: boolean;
  username?: string;
  userType?: "guild" | "neutro" | "admin" | "master_admin";
}

export const Header = ({ isLoggedIn = false, username, userType }: HeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { guild } = useGuild(user?.id);
  
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary glow-cyan tracking-wider">
            {guild?.display_name || "Claimed System"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {guild?.subtitle || "Professional respawn coordination"}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{username}</p>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    userType === "guild" || userType === "admin" || userType === "master_admin"
                      ? 'border-primary text-primary' 
                      : 'border-secondary text-secondary'
                  }`}
                >
                  {userType === "guild" 
                    ? "Guild Member" 
                    : userType === "admin" 
                    ? "Admin" 
                    : userType === "master_admin" 
                    ? "Master Admin" 
                    : "Neutro"}
                </Badge>
              </div>
              {user && <NotificationPanel userId={user.id} desktopNotificationsEnabled={profile?.desktop_notifications ?? true} />}
              <Button 
                variant="outline" 
                size="icon" 
                className="border-border hover:border-primary"
                onClick={() => navigate('/profile')}
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground glow-cyan">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
