import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Trash2, Palette } from "lucide-react";
import { toast } from "sonner";
import { ThemeSelector } from "@/components/ui/ThemeSelector";
import { useTracking } from "@/hooks/useTracking";
import { usePremium } from "@/hooks/usePremium";

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const { stats } = useTracking();
  const isPremium = usePremium();

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

          {isPremium && (
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                💎 Premium Insights
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20">
                  <p className="text-2xl font-bold text-primary">{stats.pitch_created || 0}</p>
                  <p className="text-sm text-muted-foreground">Pitchs créés</p>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20">
                  <p className="text-2xl font-bold text-primary">{stats.avatars_generated || 0}</p>
                  <p className="text-sm text-muted-foreground">Avatars générés</p>
                </div>
              </div>
            </Card>
          )}

          <ThemeSelector />

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-4">Politique de Confidentialité</h3>
            <div className="space-y-4 text-sm leading-relaxed">
              <div>
                <h4 className="font-bold text-primary mb-2">Introduction</h4>
                <p className="text-muted-foreground">
                  Max Marketing s'engage à protéger la confidentialité de ses utilisateurs. Cette politique décrit comment nous collectons, utilisons et protégeons vos informations personnelles.
                </p>
              </div>

              <hr className="border-border" />

              <div>
                <h4 className="font-bold text-primary mb-2">Collecte des Données</h4>
                <p className="text-muted-foreground">
                  Nous collectons uniquement les informations nécessaires au fonctionnement de notre service :
                  nom d'utilisateur, adresse e-mail, et données de génération de contenu.
                  Aucune donnée n'est vendue à des tiers.
                </p>
              </div>

              <hr className="border-border" />

              <div>
                <h4 className="font-bold text-primary mb-2">Utilisation des Données</h4>
                <p className="text-muted-foreground">
                  Vos données sont utilisées pour améliorer votre expérience, générer du contenu marketing personnalisé,
                  et vous fournir un support client de qualité. Les utilisateurs Premium bénéficient d'une synchronisation cloud sécurisée.
                </p>
              </div>

              <hr className="border-border" />

              <div>
                <h4 className="font-bold text-primary mb-2">Stockage et Sécurité</h4>
                <p className="text-muted-foreground">
                  Les données gratuites sont stockées localement dans votre navigateur. Les données Premium sont chiffrées
                  et stockées sur des serveurs sécurisés. Nous utilisons des protocoles de sécurité standard de l'industrie.
                </p>
              </div>

              <hr className="border-border" />

              <div>
                <h4 className="font-bold text-primary mb-2">Vos Droits</h4>
                <p className="text-muted-foreground">
                  Vous pouvez à tout moment accéder, modifier ou supprimer vos données personnelles.
                  Pour exercer ces droits, contactez-nous à privacy@maxmarketing.com
                </p>
              </div>

              <hr className="border-border" />

              <div>
                <h4 className="font-bold text-primary mb-2">Cookies et Tracking</h4>
                <p className="text-muted-foreground">
                  Nous utilisons des cookies essentiels pour le fonctionnement du site.
                  Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
                </p>
              </div>

              <hr className="border-border" />

              <div>
                <h4 className="font-bold text-primary mb-2">Modifications</h4>
                <p className="text-muted-foreground">
                  Cette politique peut être mise à jour. Les changements significatifs vous seront notifiés par e-mail.
                  Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
                </p>
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
