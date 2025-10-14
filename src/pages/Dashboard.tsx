import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentUser = localStorage.getItem("max_current_user");
    if (!currentUser) {
      navigate("/auth");
    }

    const savedMessages = localStorage.getItem("max_chat_history");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat-assistant", {
        body: { 
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      const newMessages = [...messages, userMessage, assistantMessage];
      setMessages(newMessages);
      localStorage.setItem("max_chat_history", JSON.stringify(newMessages));
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la génération de la réponse");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <header className="border-b border-border p-6">
          <h1 className="text-2xl font-bold">Chat Assistant Marketing</h1>
          <p className="text-muted-foreground">
            Posez toutes vos questions marketing, stratégie, contenu et technique
          </p>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Bienvenue sur Max Marketing</h2>
              <p className="text-muted-foreground">
                Commencez par poser une question ou décrire votre besoin marketing
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-3xl rounded-2xl p-4 ${
                    message.role === "user"
                      ? "gradient-primary text-white"
                      : "bg-card border border-border"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-muted-foreground">Max réfléchit...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-border p-6">
          <div className="max-w-4xl mx-auto flex gap-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Posez votre question marketing..."
              className="min-h-[60px] bg-secondary border-border resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="gradient-primary shadow-glow"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
