import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, HelpCircle } from "lucide-react";

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-lg w-full p-8 space-y-6 text-center shadow-lg animate-fade-in">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Paiement annulé
          </h1>
          <p className="text-muted-foreground">
            Votre paiement a été annulé. Aucun montant n'a été débité.
          </p>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Vous pouvez réessayer à tout moment pour accéder aux fonctionnalités Premium.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate("/premium")}
            size="lg"
            className="w-full gradient-primary text-white font-bold"
          >
            Réessayer le paiement
          </Button>

          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>

          <Button
            onClick={() => window.open("mailto:support@maxmarketing.com")}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Besoin d'aide ?
          </Button>
        </div>
      </Card>
    </div>
  );
}
