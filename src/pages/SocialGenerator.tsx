import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Copy, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTracking } from "@/hooks/useTracking";
import { usePersistence } from "@/hooks/usePersistence";

interface SocialContent {
  linkedin: string;
  instagram: string;
  tiktok: string;
  facebook: string;
  explanation: string;
}

const SocialGenerator = () => {
  const navigate = useNavigate();
  const { trackAction } = useTracking();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SocialContent | null>(null);
  const [topic, setTopic] = useState("");
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  // Persistence
  const { saveData: saveResult } = usePersistence("max_social_result", result);

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
    if (!topic.trim()) {
      toast.error("Veuillez entrer un sujet pour votre contenu");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("social-generator", {
        body: { topic },
      });

      if (error) throw error;

      setResult(data.content);
      saveResult(data.content);
      
      const history = JSON.parse(localStorage.getItem("max_social_history") || "[]");
      history.unshift({
        topic,
        result: data.content,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("max_social_history", JSON.stringify(history.slice(0, 50)));
      
      trackAction("social_posts_generated");
      toast.success("Contenus générés avec succès !");
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la génération des contenus");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (platform: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedPlatform(platform);
    toast.success(`Copié pour ${platform} !`);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <header className="border-b border-border p-6">
          <h1 className="text-2xl font-bold">Générateur de Contenu Social</h1>
          <p className="text-muted-foreground">
            Créez du contenu viral pour tous vos réseaux sociaux en un clic
          </p>
        </header>

        <div className="p-6 max-w-6xl mx-auto space-y-6">
          <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Sujet ou Thème du Post</Label>
                <Textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ex: Comment augmenter son taux d'engagement sur les réseaux sociaux"
                  className="bg-secondary border-border min-h-[120px]"
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
                  "Générer le Contenu pour Tous les Réseaux"
                )}
              </Button>
            </div>
          </div>

          {result && (
            <div className="bg-card rounded-2xl shadow-card border border-border">
              <Tabs defaultValue="linkedin" className="w-full">
                <TabsList className="w-full justify-start rounded-t-2xl border-b border-border bg-secondary/50 p-0">
                  <TabsTrigger value="linkedin" className="rounded-none data-[state=active]:bg-card px-6 py-4">
                    LinkedIn
                  </TabsTrigger>
                  <TabsTrigger value="instagram" className="rounded-none data-[state=active]:bg-card px-6 py-4">
                    Instagram
                  </TabsTrigger>
                  <TabsTrigger value="tiktok" className="rounded-none data-[state=active]:bg-card px-6 py-4">
                    TikTok
                  </TabsTrigger>
                  <TabsTrigger value="facebook" className="rounded-none data-[state=active]:bg-card px-6 py-4">
                    Facebook
                  </TabsTrigger>
                  <TabsTrigger value="explanation" className="rounded-none data-[state=active]:bg-card px-6 py-4">
                    Analyse
                  </TabsTrigger>
                </TabsList>

                {["linkedin", "instagram", "tiktok", "facebook"].map((platform) => (
                  <TabsContent key={platform} value={platform} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg capitalize">{platform}</h3>
                        <Button
                          onClick={() => handleCopy(platform, result[platform as keyof SocialContent] as string)}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          {copiedPlatform === platform ? (
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
                          {result[platform as keyof SocialContent]}
                        </pre>
                      </div>
                    </div>
                  </TabsContent>
                ))}

                <TabsContent value="explanation" className="p-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Pourquoi ce contenu peut devenir viral</h3>
                    <div className="prose prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm bg-secondary p-4 rounded-lg">
                        {result.explanation}
                      </pre>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {!result && !isLoading && (
            <div className="bg-card rounded-2xl shadow-card p-12 border border-border text-center">
              <p className="text-muted-foreground">
                Entrez un sujet et générez du contenu optimisé pour chaque plateforme
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SocialGenerator;
