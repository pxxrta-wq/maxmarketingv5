import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      toast.success("📧 Email de réinitialisation envoyé !", {
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe",
      });
      
      setTimeout(() => navigate("/auth"), 2000);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast.error("Erreur lors de l'envoi de l'email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 bg-card border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Mot de passe oublié ?</h1>
          <p className="text-muted-foreground">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-secondary border-border"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary shadow-glow"
          >
            {loading ? "Envoi en cours..." : "🔐 Envoyer le lien"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/auth")}
            className="w-full"
          >
            Retour à la connexion
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;
