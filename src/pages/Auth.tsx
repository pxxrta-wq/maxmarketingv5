import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SupabaseAuthForm } from "@/components/auth/SupabaseAuthForm";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isRecovery, setIsRecovery] = useState(false);

  const handleSuccess = () => {
    navigate("/dashboard", { replace: true });
  };

  useEffect(() => {
    // Handle password recovery mode
    const mode = searchParams.get("mode");
    if (mode === "recovery") {
      setIsRecovery(true);
      return;
    }

    // Vérifier session uniquement au montage
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard", { replace: true });
      }
    };
    
    checkInitialSession();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-glow mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Max Marketing</h1>
          <p className="text-muted-foreground">
            Votre stratège marketing personnel, alimenté par l'IA
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-8 border border-border">
          <SupabaseAuthForm onSuccess={handleSuccess} />
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/reset-password")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Mot de passe oublié ?
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Essayez gratuitement. Aucune carte bancaire requise.
        </p>
      </div>
    </div>
  );
};

export default Auth;
