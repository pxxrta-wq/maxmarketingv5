import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, TrendingUp, Share2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const History = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    emails: 0,
    plans: 0,
    social: 0,
    chats: 0,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();

    const emailHistory = JSON.parse(localStorage.getItem("max_email_history") || "[]");
    const planHistory = JSON.parse(localStorage.getItem("max_plan_history") || "[]");
    const socialHistory = JSON.parse(localStorage.getItem("max_social_history") || "[]");
    const chatHistory = JSON.parse(localStorage.getItem("max_chat_history") || "[]");

    setStats({
      emails: emailHistory.length,
      plans: planHistory.length,
      social: socialHistory.length,
      chats: chatHistory.filter((m: any) => m.role === "user").length,
    });
  }, [navigate]);

  const renderHistoryList = (storageKey: string) => {
    const history = JSON.parse(localStorage.getItem(storageKey) || "[]");
    
    if (history.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          Aucun historique pour le moment
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {history.map((item: any, index: number) => (
          <Card key={index} className="p-6 bg-card border-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">
                  {new Date(item.timestamp).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <div className="text-sm">
                  {item.product && <p><strong>Produit:</strong> {item.product}</p>}
                  {item.business && <p><strong>Activité:</strong> {item.business}</p>}
                  {item.topic && <p><strong>Sujet:</strong> {item.topic}</p>}
                  {item.objective && <p className="mt-1"><strong>Objectif:</strong> {item.objective}</p>}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <header className="border-b border-border p-6">
          <h1 className="text-2xl font-bold">Historique & Statistiques</h1>
          <p className="text-muted-foreground">
            Consultez vos générations et vos performances
          </p>
        </header>

        <div className="p-6 max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.emails}</p>
                  <p className="text-sm text-muted-foreground">Emails</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.plans}</p>
                  <p className="text-sm text-muted-foreground">Plans</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.social}</p>
                  <p className="text-sm text-muted-foreground">Posts Sociaux</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.chats}</p>
                  <p className="text-sm text-muted-foreground">Messages</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <Tabs defaultValue="emails" className="w-full">
              <TabsList className="w-full justify-start rounded-t-2xl border-b border-border bg-secondary/50 p-0">
                <TabsTrigger value="emails" className="rounded-none data-[state=active]:bg-card px-6 py-4">
                  Emails
                </TabsTrigger>
                <TabsTrigger value="plans" className="rounded-none data-[state=active]:bg-card px-6 py-4">
                  Plans Marketing
                </TabsTrigger>
                <TabsTrigger value="social" className="rounded-none data-[state=active]:bg-card px-6 py-4">
                  Contenu Social
                </TabsTrigger>
              </TabsList>

              <TabsContent value="emails" className="p-6">
                {renderHistoryList("max_email_history")}
              </TabsContent>

              <TabsContent value="plans" className="p-6">
                {renderHistoryList("max_plan_history")}
              </TabsContent>

              <TabsContent value="social" className="p-6">
                {renderHistoryList("max_social_history")}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default History;
