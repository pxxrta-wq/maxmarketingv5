import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, Zap, Crown, Shield, Rocket, BarChart, Download, Palette, Key, HeadphonesIcon, Cloud } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePremium } from "@/hooks/usePremium";
const premiumFeatures = [{
  icon: Zap,
  text: "Générations IA illimitées"
}, {
  icon: Crown,
  text: "Priorité GPT-4-Turbo"
}, {
  icon: Rocket,
  text: "Tous les modules déverrouillés"
}, {
  icon: BarChart,
  text: "Tests A/B automatiques"
}, {
  icon: Download,
  text: "Export PDF/Excel"
}, {
  icon: BarChart,
  text: "Tableau de bord avancé"
}, {
  icon: Palette,
  text: "Thèmes premium (clair/sombre/néon)"
}, {
  icon: Shield,
  text: "Mode confidentiel"
}, {
  icon: Key,
  text: "API personnelle"
}, {
  icon: HeadphonesIcon,
  text: "Support prioritaire"
}, {
  icon: Sparkles,
  text: "Badge Premium"
}, {
  icon: Cloud,
  text: "Synchronisation cloud"
}];
export default function Premium() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const {
    isPremium,
    refresh
  } = usePremium();
  useEffect(() => {
    // Check if user just completed payment
    if (searchParams.get("premium") === "true") {
      toast.success("🎉 Bienvenue dans Max Marketing Premium !", {
        description: "Toutes les fonctionnalités sont maintenant débloquées !"
      });
      refresh();
    }
  }, [searchParams, refresh]);
  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, "_blank");
        toast.success("Redirection vers le paiement sécurisé...");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Erreur lors de la création de la session de paiement");
    } finally {
      setLoading(false);
    }
  };
  const handleUpgradeWithPayPal = async () => {
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke("create-paypal-subscription");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
        toast.success("Redirection vers PayPal...");
      }
    } catch (error) {
      console.error("Error creating PayPal subscription:", error);
      toast.error("Erreur lors de la redirection PayPal");
    } finally {
      setLoading(false);
    }
  };
  return <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-glow mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Passez à Max Marketing Premium
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Débloquez toute la puissance de l'IA marketing et développez votre business plus rapidement
            </p>
          </div>

          {/* Pricing Card */}
          <Card className="p-8 gradient-primary-subtle border-2 border-primary/20 shadow-elegant">
            <div className="text-center space-y-6">
              <Badge className="bg-primary text-primary-foreground text-sm px-4 py-1">
                ⚡ Offre de lancement
              </Badge>
              
              <div>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-foreground">19€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">🎁Essai gratuit 7 jours • Annulable à tout moment</p>
              </div>

              {!isPremium ? <Button onClick={handleUpgrade} disabled={loading} size="lg" className="gradient-primary text-white font-bold text-lg px-12 py-6 hover-scale">
                  {loading ? "Traitement..." : "✨ Passer en Premium maintenant"}
                </Button> : <div className="space-y-3">
                  <Badge className="bg-green-500 text-white text-lg px-6 py-2">
                    ✓ Vous êtes Premium !
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Profitez de toutes les fonctionnalités avancées
                  </p>
                </div>}
            </div>
          </Card>

          {!isPremium && <Card className="p-6">
              <div className="flex items-center justify-center gap-3">
                <Button onClick={handleUpgrade} disabled={loading} className="gradient-primary text-white font-bold">
                  Payer par carte (Stripe / Apple Pay)
                </Button>
                <Button onClick={handleUpgradeWithPayPal} disabled={loading} variant="outline">
                  Payer avec PayPal
                </Button>
              </div>
            </Card>}

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {premiumFeatures.map((feature, index) => <Card key={index} className="p-4 hover:shadow-lg transition-smooth hover:border-primary/30">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{feature.text}</p>
                  </div>
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                </div>
              </Card>)}
          </div>

          {/* Comparison Table */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Gratuit vs Premium</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 pb-3 border-b border-border">
                <div className="font-semibold text-foreground">Fonctionnalité</div>
                <div className="text-center font-semibold text-muted-foreground">Gratuit</div>
                <div className="text-center font-semibold text-primary">Premium</div>
              </div>

              {[{
              feature: "E-mails marketing",
              free: "3/mois",
              premium: "Illimité"
            }, {
              feature: "Plans marketing",
              free: "2/mois",
              premium: "Illimité"
            }, {
              feature: "Posts réseaux sociaux",
              free: "3/mois",
              premium: "Illimité"
            }, {
              feature: "Conversations chat",
              free: "10/mois",
              premium: "Illimité"
            }, {
              feature: "Pitch Creator",
              free: "✗",
              premium: "✓"
            }, {
              feature: "Avatar Client",
              free: "✗",
              premium: "✓"
            }, {
              feature: "Export PDF/Excel",
              free: "✗",
              premium: "✓"
            }, {
              feature: "Tests A/B",
              free: "✗",
              premium: "✓"
            }, {
              feature: "Support prioritaire",
              free: "✗",
              premium: "✓"
            }].map((row, index) => <div key={index} className="grid grid-cols-3 gap-4 py-3 border-b border-border/50">
                  <div className="text-foreground">{row.feature}</div>
                  <div className="text-center text-muted-foreground">{row.free}</div>
                  <div className="text-center text-primary font-semibold">{row.premium}</div>
                </div>)}
            </div>
          </Card>

          {/* FAQ */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Questions fréquentes</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Puis-je annuler à tout moment ?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Oui, vous pouvez annuler votre abonnement à tout moment depuis vos paramètres.
                  Aucun engagement.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  L'essai gratuit est-il vraiment gratuit ?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Oui ! Profitez de 7 jours gratuits pour tester toutes les fonctionnalités Premium.
                  Vous ne serez débité qu'à la fin de la période d'essai si vous continuez.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Quels moyens de paiement acceptez-vous ?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Nous acceptons toutes les cartes bancaires via Stripe (Visa, Mastercard, Amex).
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>;
}