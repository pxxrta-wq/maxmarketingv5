import { NavLink } from "react-router-dom";
import { MessageSquare, Mail, TrendingUp, Share2, History, Settings, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const navItems = [
  { to: "/dashboard", icon: MessageSquare, label: "Chat Assistant" },
  { to: "/email-generator", icon: Mail, label: "Emails Marketing" },
  { to: "/plan-generator", icon: TrendingUp, label: "Plans Marketing" },
  { to: "/social-generator", icon: Share2, label: "Contenu Social" },
  { to: "/history", icon: History, label: "Historique" },
  { to: "/settings", icon: Settings, label: "Paramètres" },
];

export const Sidebar = () => {
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
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
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
