import { ReactNode } from "react";
import { Header } from "./Header";
import { Link, useLocation } from "react-router-dom";
import { Home, FileSpreadsheet, Settings, User, Skull, Ticket, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

interface DashboardLayoutProps {
  children: ReactNode;
  isAdmin?: boolean;
}

export const DashboardLayout = ({ children, isAdmin = false }: DashboardLayoutProps) => {
  const location = useLocation();
  const { user, userRole } = useAuth();
  const { profile, characters } = useProfile(user?.id);

  const navItems = [
    { icon: Home, label: "Respawns", path: "/dashboard" },
    { icon: FileSpreadsheet, label: "Planilhados", path: "/planilhados" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Skull, label: "Hunteds", path: "/hunteds" },
    { icon: Ticket, label: "Tickets", path: "/tickets" },
    ...((userRole === 'admin' || userRole === 'master_admin') ? [{ icon: Settings, label: "Admin", path: "/admin" }] : []),
    ...(userRole === 'master_admin' ? [{ icon: Shield, label: "Master Admin", path: "/master-admin" }] : []),
  ];

  const activeCharacter = characters?.find(char => char.id === profile?.active_character_id);
  const displayName = activeCharacter?.name || user?.email?.split('@')[0] || "User";

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        isLoggedIn={!!user} 
        username={displayName} 
        userType={userRole === 'admin' || userRole === 'master_admin' ? userRole : userRole as "guild" | "neutro"} 
      />
      
      <nav className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-[73px] z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                    isActive
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};
