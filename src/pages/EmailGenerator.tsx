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
import { usePersistence } from "@/hooks/usePersistence";
import { typewriterEffect } from "@/utils/typewriter";

const EmailGenerator = () => {
  const navigate = useNavigate();
  const { trackAction } = useTracking();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [formData, setFormData] = useState({
    product: "",
    objective: "",
    audience: "",
    tone: "",
    offer: "",
  });

  // Persistence
  const { saveData: saveResult } = usePersistence("max_email_result", result);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleGenerate = async () => {
    if (!formData.product || !formData.objective || !formData.audience) {
      toast.error("Veuillez remplir au moins les 3 premiers champs");
      return;
    }

    setIsLoading(true);
    setResult("");

    try {
      const { data, error } = await supabase.functions.invoke("email-generator", {
        body: formData,
      });

      if (error) throw error;

      setIsTyping(true);
      await typewriterEffect(data.email, (partial) => {
        setResult(partial);
        saveResult(partial);
      });
      setIsTyping(false);
      
      const history = JSON.parse(localStorage.getItem("max_email_history") || "[]");
      history.unshift({
        ...formData,
        result: data.email,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("max_email_history", JSON.stringify(history.slice(0, 50)));
      
      trackAction("emails_generated");
      toast.success("Email généré avec succès !");
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la génération de l'email");
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
          <h1 className="text-2xl font-bold">Générateur d'Emails Marketing</h1>
          <p className="text-muted-foreground">
            Créez des emails hautement performants optimisés pour la conversion
          </p>
        </header>

        <div className="p-6 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-card rounded-2xl shadow-card p-6 border border-border space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Produit / Service *</Label>
                  <Input
                    id="product"
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    placeholder="Ex: Formation en ligne marketing digital"
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objective">Objectif de la campagne *</Label>
                  <Input
                    id="objective"
                    value={formData.objective}
                    onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                    placeholder="Ex: Augmenter les inscriptions de 30%"
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience">Audience cible *</Label>
                  <Input
                    id="audience"
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    placeholder="Ex: Entrepreneurs 30-45 ans"
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone">Ton de la marque</Label>
                  <Input
                    id="tone"
                    value={formData.tone}
                    onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                    placeholder="Ex: Professionnel et inspirant"
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="offer">Offre / Bénéfice clé</Label>
                  <Textarea
                    id="offer"
                    value={formData.offer}
                    onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
                    placeholder="Ex: -30% jusqu'à vendredi + bonus exclusif"
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
                    "Générer l'Email"
                  )}
                </Button>
              </div>
            </div>

            <div>
              {result ? (
                <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Email Généré</h3>
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
                    <pre className="whitespace-pre-wrap text-sm bg-secondary p-4 rounded-lg leading-relaxed">
                      {result}
                      {isTyping && <span className="animate-pulse">▊</span>}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-2xl shadow-card p-12 border border-border text-center">
                  <p className="text-muted-foreground">
                    Remplissez le formulaire et cliquez sur "Générer l'Email" pour voir le résultat
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

export default EmailGenerator;
