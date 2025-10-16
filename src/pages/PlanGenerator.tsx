import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTracking } from "@/hooks/useTracking";
import { typewriterEffect } from "@/utils/typewriter";

const PlanGenerator = () => {
  const navigate = useNavigate();
  const { trackAction } = useTracking();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [formData, setFormData] = useState({
    business: "",
    objective: "",
    target: "",
    duration: "",
    budget: "",
    channels: "",
  });

  useEffect(() => {
    const currentUser = localStorage.getItem("max_current_user");
    if (!currentUser) {
      navigate("/auth");
    }
  }, [navigate]);

  const handleGenerate = async () => {
    if (!formData.business || !formData.objective || !formData.target) {
      toast.error("Veuillez remplir au moins les 3 premiers champs");
      return;
    }

    setIsLoading(true);
    setResult("");

    try {
      const { data, error } = await supabase.functions.invoke("plan-generator", {
        body: formData,
      });

      if (error) throw error;

      setIsTyping(true);
      await typewriterEffect(data.plan, (partial) => {
        setResult(partial);
      }, 30);
      setIsTyping(false);
      
      const history = JSON.parse(localStorage.getItem("max_plan_history") || "[]");
      history.unshift({
        ...formData,
        result: data.plan,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("max_plan_history", JSON.stringify(history.slice(0, 50)));
      
      trackAction("plans_generated");
      toast.success("Plan marketing généré avec succès !");
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la génération du plan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copié dans le presse-papier !");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <header className="border-b border-border p-6">
          <h1 className="text-2xl font-bold">Générateur de Plans Marketing</h1>
          <p className="text-muted-foreground">
            Créez des stratégies marketing complètes et actionnables
          </p>
        </header>

        <div className="p-6 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-card rounded-2xl shadow-card p-6 border border-border space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business">Activité / Secteur *</Label>
                  <Input
                    id="business"
                    value={formData.business}
                    onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                    placeholder="Ex: E-commerce mode durable"
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objective">Objectif Principal *</Label>
                  <Input
                    id="objective"
                    value={formData.objective}
                    onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                    placeholder="Ex: Augmenter CA de 50% en 6 mois"
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target">Cible Principale *</Label>
                  <Input
                    id="target"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    placeholder="Ex: Femmes 25-40 ans éco-responsables"
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Durée de la stratégie</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="Ex: 6 mois"
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget Estimé</Label>
                  <Input
                    id="budget"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="Ex: 10 000€/mois"
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="channels">Canaux Prioritaires</Label>
                  <Textarea
                    id="channels"
                    value={formData.channels}
                    onChange={(e) => setFormData({ ...formData, channels: e.target.value })}
                    placeholder="Ex: Instagram, Google Ads, Email Marketing"
                    className="bg-secondary border-border min-h-[100px]"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="w-full gradient-primary font-semibold shadow-glow"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Génération en cours...
                    </>
                  ) : (
                    "Générer le Plan Marketing"
                  )}
                </Button>
              </div>
            </div>

            <div>
              {result ? (
                <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Plan Marketing Généré</h3>
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Copié !
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copier
                        </>
                      )}
                    </Button>
                  </div>
                   <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm bg-secondary p-4 rounded-lg max-h-[600px] overflow-y-auto leading-relaxed">
                      {result}
                      {isTyping && <span className="animate-pulse">▊</span>}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-2xl shadow-card p-12 border border-border text-center">
                  <p className="text-muted-foreground">
                    Remplissez le formulaire et cliquez sur "Générer le Plan Marketing" pour voir le résultat
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlanGenerator;
