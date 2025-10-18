import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    toast.success("🎉 Bienvenue dans Max Marketing Premium !", {
      description: "Toutes les fonctionnalités sont maintenant débloquées !",
      duration: 5000,
    });

    // Countdown to redirect
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
      <Card className="max-w-2xl w-full p-8 space-y-6 text-center shadow-elegant animate-fade-in">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-glow animate-pulse">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Paiement réussi !
          </h1>
          <p className="text-xl text-muted-foreground">
            Bienvenue dans Max Marketing Premium
          </p>
        </div>

        <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            ✨ Vous avez maintenant accès à :
          </h2>
          <ul className="space-y-2 text-left text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Générations IA illimitées
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Tous les modules (Pitch, Avatar Client, etc.)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Thèmes premium exclusifs
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Export PDF & Excel
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Support prioritaire
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Un email de confirmation vous a été envoyé avec tous les détails.
          </p>
          
          <Button
            onClick={() => navigate("/dashboard")}
            size="lg"
            className="w-full gradient-primary text-white font-bold hover-scale"
          >
            Commencer à utiliser Premium <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-xs text-muted-foreground">
            Redirection automatique dans {countdown}s...
          </p>
        </div>
      </Card>
    </div>
  );
}
