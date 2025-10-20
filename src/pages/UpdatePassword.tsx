import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const UpdatePassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);

  useEffect(() => {
    // Check if we have a valid recovery token
    const checkToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check if we're in recovery mode
      const type = searchParams.get("type");
      if (type === "recovery" && session) {
        setValidToken(true);
      } else {
        toast.error("Lien invalide ou expiré");
        setTimeout(() => navigate("/reset-password"), 2000);
      }
    };

    checkToken();
  }, [navigate, searchParams]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast.success("✅ Votre mot de passe a été mis à jour avec succès");
      
      // Sign out to force re-login with new password
      await supabase.auth.signOut();
      
      setTimeout(() => navigate("/auth"), 2000);
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error("Erreur lors de la mise à jour du mot de passe");
    } finally {
      setLoading(false);
    }
  };

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-8 bg-card border-border">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Vérification en cours...</h1>
            <p className="text-muted-foreground">
              Veuillez patienter pendant que nous vérifions votre lien
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 bg-card border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🔒 Nouveau mot de passe</h1>
          <p className="text-muted-foreground">
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nouveau mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="bg-secondary border-border"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary shadow-glow"
          >
            {loading ? "Mise à jour..." : "🔐 Mettre à jour mon mot de passe"}
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

export default UpdatePassword;
