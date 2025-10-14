import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { Sparkles } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem("max_current_user");
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSuccess = () => {
    navigate("/dashboard");
  };

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
          <AuthForm onSuccess={handleSuccess} />
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Essayez gratuitement. Aucune carte bancaire requise.
        </p>
      </div>
    </div>
  );
};

export default Auth;
