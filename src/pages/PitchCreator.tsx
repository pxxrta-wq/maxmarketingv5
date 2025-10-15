import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, Copy, Download, Rocket } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function PitchCreator() {
  const [product, setProduct] = useState("");
  const [problem, setProblem] = useState("");
  const [market, setMarket] = useState("");
  const [traction, setTraction] = useState("");
  const [pitch, setPitch] = useState("");
  const [loading, setLoading] = useState(false);

  const isPremium = localStorage.getItem("max_premium") === "true";

  const generatePitch = async () => {
    if (!isPremium) {
      toast.error("🔒 Cette fonctionnalité est réservée aux membres Premium");
      return;
    }

    if (!product || !problem) {
      toast.error("Veuillez renseigner au minimum le produit et le problème");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("pitch-creator", {
        body: { product, problem, market, traction },
      });

      if (error) throw error;
      setPitch(data.pitch);
      toast.success("✨ Pitch généré avec succès !");
    } catch (error: any) {
      console.error("Erreur génération pitch:", error);
      toast.error("Erreur lors de la génération du pitch");
    } finally {
      setLoading(false);
    }
  };

  const copyPitch = () => {
    navigator.clipboard.writeText(pitch);
    toast.success("Pitch copié !");
  };

  const downloadPitch = () => {
    const blob = new Blob([pitch], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pitch-max-marketing.txt";
    a.click();
    toast.success("Pitch téléchargé !");
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">💎 Pitch Creator Pro</h1>
              <p className="text-muted-foreground">Créez des pitchs irrésistibles pour investisseurs et partenaires</p>
            </div>
          </div>

          {!isPremium && (
            <Card className="p-6 bg-gradient-to-r from-orange-500/10 to-purple-500/10 border-orange-500/20">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-orange-500" />
                <div>
                  <h3 className="font-semibold text-foreground">Fonctionnalité Premium</h3>
                  <p className="text-sm text-muted-foreground">
                    Passez à Premium pour créer des pitchs professionnels illimités
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Informations du projet
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Produit/Service *
                  </label>
                  <Input
                    placeholder="Ex: Application de gestion de tâches IA"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Problème résolu *
                  </label>
                  <Textarea
                    placeholder="Quel problème majeur résolvez-vous ?"
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    className="bg-background/50 min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Marché cible
                  </label>
                  <Input
                    placeholder="Ex: PME en France, 10-50 employés"
                    value={market}
                    onChange={(e) => setMarket(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Traction actuelle
                  </label>
                  <Textarea
                    placeholder="Ex: 500 utilisateurs, 20K€ MRR, partenariat avec X"
                    value={traction}
                    onChange={(e) => setTraction(e.target.value)}
                    className="bg-background/50 min-h-[80px]"
                  />
                </div>

                <Button
                  onClick={generatePitch}
                  disabled={loading || !isPremium}
                  className="w-full gradient-primary text-white font-semibold"
                >
                  {loading ? "Génération..." : "🚀 Créer mon Pitch"}
                </Button>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Votre Pitch</h2>
                {pitch && (
                  <div className="flex gap-2">
                    <Button onClick={copyPitch} variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Copier
                    </Button>
                    <Button onClick={downloadPitch} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                )}
              </div>

              <div className="bg-background/50 rounded-lg p-6 min-h-[500px] max-h-[600px] overflow-y-auto">
                {pitch ? (
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-foreground font-sans">{pitch}</pre>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-20">
                    Votre pitch apparaîtra ici...
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
