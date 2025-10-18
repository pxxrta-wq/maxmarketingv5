import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PremiumGuard } from "@/components/premium/PremiumGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Users, Copy, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTracking } from "@/hooks/useTracking";
import { typewriterEffect } from "@/utils/typewriter";
import { usePremium } from "@/hooks/usePremium";

export default function AvatarCreator() {
  const { trackAction } = useTracking();
  const isPremium = usePremium();
  const [business, setBusiness] = useState("");
  const [product, setProduct] = useState("");
  const [goal, setGoal] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const generateAvatar = async () => {
    if (!isPremium) {
      toast.error("🔒 Cette fonctionnalité est réservée aux membres Premium");
      return;
    }

    if (!business || !product) {
      toast.error("Veuillez renseigner l'activité et le produit");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("avatar-creator", {
        body: { business, product, goal },
      });

      if (error) throw error;
      
      setIsTyping(true);
      await typewriterEffect(data.avatar, (partial) => {
        setAvatar(partial);
      }, 30);
      setIsTyping(false);
      
      trackAction("avatars_generated");
      toast.success("✨ Avatar client créé avec succès !");
    } catch (error: any) {
      console.error("Erreur génération avatar:", error);
      toast.error("Erreur lors de la génération de l'avatar");
    } finally {
      setLoading(false);
    }
  };

  const copyAvatar = () => {
    navigator.clipboard.writeText(avatar);
    toast.success("Avatar copié !");
  };

  const downloadAvatar = () => {
    const blob = new Blob([avatar], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "avatar-client-max-marketing.txt";
    a.click();
    toast.success("Avatar téléchargé !");
  };

  return (
    <PremiumGuard feature="L'Avatar Client">
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">👥 Avatar Client Idéal</h1>
              <p className="text-muted-foreground">Créez des profils détaillés de vos clients parfaits</p>
            </div>
          </div>

          {!isPremium && (
            <Card className="p-6 bg-gradient-to-r from-orange-500/10 to-purple-500/10 border-orange-500/20">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-orange-500" />
                <div>
                  <h3 className="font-semibold text-foreground">Fonctionnalité Premium</h3>
                  <p className="text-sm text-muted-foreground">
                    Passez à Premium pour créer des avatars clients illimités
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Informations de base
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Votre activité *
                  </label>
                  <Input
                    placeholder="Ex: Agence de marketing digital"
                    value={business}
                    onChange={(e) => setBusiness(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Produit/Service *
                  </label>
                  <Textarea
                    placeholder="Décrivez votre offre principale"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className="bg-background/50 min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Objectif principal (optionnel)
                  </label>
                  <Input
                    placeholder="Ex: Augmenter conversions, fidéliser clients..."
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <Button
                  onClick={generateAvatar}
                  disabled={loading || !isPremium}
                  className="w-full gradient-primary text-white font-semibold"
                >
                  {loading ? "Génération..." : "🎯 Créer mon Avatar Client"}
                </Button>
              </div>

              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h3 className="text-sm font-semibold text-foreground mb-2">💡 Ce que vous obtiendrez :</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Profil démographique et psychographique</li>
                  <li>• Pain points et motivations</li>
                  <li>• Parcours client type</li>
                  <li>• Canaux de communication préférés</li>
                  <li>• Messages clés à utiliser</li>
                </ul>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Votre Avatar</h2>
                {avatar && (
                  <div className="flex gap-2">
                    <Button onClick={copyAvatar} variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Copier
                    </Button>
                    <Button onClick={downloadAvatar} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                )}
              </div>

              <div className="bg-background/50 rounded-lg p-6 min-h-[500px] max-h-[600px] overflow-y-auto">
                {avatar ? (
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-foreground font-sans">{avatar}</pre>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-20">
                    Votre avatar client apparaîtra ici...
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
      </div>
    </PremiumGuard>
  );
}
