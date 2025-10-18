import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { usePremium } from "@/hooks/usePremium";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PremiumGuardProps {
  children: ReactNode;
  feature: string;
}

export const PremiumGuard = ({ children, feature }: PremiumGuardProps) => {
  const { isPremium, loading } = usePremium();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-4 p-8">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-lg w-full p-8 space-y-6 text-center shadow-elegant">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-glow">
              <Lock className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
              <Crown className="w-6 h-6 text-primary" />
              Fonctionnalité Premium
            </h2>
            <p className="text-muted-foreground">
              {feature} est réservé aux membres Premium
            </p>
          </div>

          <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground">
              Passez à Premium pour débloquer toutes les fonctionnalités avancées de Max Marketing
            </p>
          </div>

          <Button
            onClick={() => navigate("/premium")}
            size="lg"
            className="w-full gradient-primary text-white font-bold hover-scale"
          >
            ✨ Découvrir Premium
          </Button>

          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Retour à l'accueil
          </Button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
