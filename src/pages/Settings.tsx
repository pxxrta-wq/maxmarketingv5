import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Trash2 } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = localStorage.getItem("max_current_user");
    if (!currentUser) {
      navigate("/auth");
    } else {
      setUser(JSON.parse(currentUser));
    }
  }, [navigate]);

  const handleClearHistory = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer tout l'historique ?")) {
      localStorage.removeItem("max_email_history");
      localStorage.removeItem("max_plan_history");
      localStorage.removeItem("max_social_history");
      localStorage.removeItem("max_chat_history");
      toast.success("Historique supprimé avec succès");
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <header className="border-b border-border p-6">
          <h1 className="text-2xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">
            Gérez votre compte et vos préférences
          </p>
        </header>

        <div className="p-6 max-w-4xl mx-auto space-y-6">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.username}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Membre depuis</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-4">Données et Historique</h3>
            <div className="space-y-4">
              <div>
                <Label>Gestion de l'historique</Label>
                <p className="text-sm text-muted-foreground mt-1 mb-3">
                  Supprimez tout votre historique de générations stocké localement
                </p>
                <Button
                  onClick={handleClearHistory}
                  variant="destructive"
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer l'historique
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-4">À propos</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Max Marketing v1.0</p>
              <p>Assistant IA Marketing alimenté par l'intelligence artificielle</p>
              <p className="pt-2">
                Tous les contenus sont générés en temps réel et stockés localement dans votre navigateur.
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
