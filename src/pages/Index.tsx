import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Mail, TrendingUp, Share2, Zap, Target, Brain, Rocket, Users, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">Max Marketing</span>
          </div>
          <Button onClick={() => navigate("/auth")} className="gradient-primary shadow-glow">
            Commencer gratuitement
          </Button>
        </div>
      </nav>

      <main>
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Votre stratège marketing{" "}
              <span className="text-white">personnel</span>,
              <br />
              alimenté par l'IA
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Générez des emails marketing hautement performants, des plans stratégiques complets
              et du contenu viral pour tous vos réseaux sociaux en quelques secondes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                className="gradient-primary shadow-glow text-lg px-8 py-6"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Essayer gratuitement
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6"
              >
                Voir la démo
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
            <div className="bg-card rounded-2xl p-8 border border-border shadow-card hover:shadow-elegant transition-smooth">
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Emails Marketing</h3>
              <p className="text-muted-foreground">
                Créez des emails avec un taux d'ouverture supérieur à 40% grâce à nos prompts
                experts optimisés pour la conversion.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border shadow-card hover:shadow-elegant transition-smooth">
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Plans Stratégiques</h3>
              <p className="text-muted-foreground">
                Obtenez des plans marketing complets niveau cabinet de conseil avec roadmap
                30/90/180 jours et KPI.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border shadow-card hover:shadow-elegant transition-smooth">
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6">
                <Share2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Contenu Viral</h3>
              <p className="text-muted-foreground">
                Générez du contenu optimisé pour LinkedIn, Instagram, TikTok et Facebook en un
                seul clic.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border shadow-card hover:shadow-elegant transition-smooth relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                Pitch Creator
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Premium</span>
              </h3>
              <p className="text-muted-foreground">
                Créez des pitchs professionnels pour investisseurs, ventes et partenariats en quelques minutes.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border shadow-card hover:shadow-elegant transition-smooth relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                Avatar Client
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Premium</span>
              </h3>
              <p className="text-muted-foreground">
                Générez des profils clients idéaux détaillés avec données démographiques et psychographiques.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-20 bg-card/30 rounded-3xl my-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Propulsé par l'IA avancée</h2>
            <p className="text-xl text-muted-foreground">
              Max Marketing combine les meilleures pratiques de HubSpot, CXL et du neuromarketing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-secondary mx-auto mb-3 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Réponses instantanées</h4>
              <p className="text-sm text-muted-foreground">En quelques secondes</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-secondary mx-auto mb-3 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Hyper-personnalisé</h4>
              <p className="text-sm text-muted-foreground">Pour votre business</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-secondary mx-auto mb-3 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Expertise IA</h4>
              <p className="text-sm text-muted-foreground">Niveau consultant</p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold">Prêt à transformer votre marketing ?</h2>
            <p className="text-xl text-muted-foreground">
              Rejoignez les marketeurs qui utilisent l'IA pour créer du contenu performant
            </p>
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="gradient-primary shadow-glow text-lg px-8 py-6"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Commencer maintenant
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 Max Marketing. Tous droits réservés.</p>
          <button
            onClick={() => navigate("/privacy-policy")}
            className="mt-2 text-primary hover:underline"
          >
            Politique de confidentialité
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Index;
