import { NavLink } from "react-router-dom";
import { MessageSquare, Mail, TrendingUp, Share2, History, Settings, LogOut, Sparkles, Rocket, Users, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const navItems = [
  { to: "/dashboard", icon: MessageSquare, label: "Chat Assistant" },
  { to: "/email-generator", icon: Mail, label: "Emails Marketing" },
  { to: "/plan-generator", icon: TrendingUp, label: "Plans Marketing" },
  { to: "/social-generator", icon: Share2, label: "Contenu Social" },
  { to: "/pitch-creator", icon: Rocket, label: "Pitch Creator", premium: true },
  { to: "/avatar-creator", icon: Users, label: "Avatar Client", premium: true },
  { to: "/history", icon: History, label: "Historique" },
  { to: "/settings", icon: Settings, label: "Paramètres" },
];

export const Sidebar = () => {
  const isPremium = localStorage.getItem("max_premium") === "true";

  const handleLogout = () => {
    localStorage.removeItem("max_current_user");
    toast.success("Déconnexion réussie");
    window.location.href = "/";
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col min-h-screen">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Max Marketing</h1>
            <p className="text-xs text-muted-foreground">Assistant IA</p>
          </div>
        </div>
        {isPremium && (
          <Badge className="mt-3 w-full justify-center bg-gradient-to-r from-orange-500 to-purple-500 text-white">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-smooth ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </div>
            {item.premium && !isPremium && (
              <Crown className="w-4 h-4 text-orange-500" />
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        {!isPremium && (
          <NavLink to="/premium">
            <Button
              variant="default"
              className="w-full gradient-primary text-white font-semibold hover-scale"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Passer Premium
            </Button>
          </NavLink>
        )}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-3"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
};
