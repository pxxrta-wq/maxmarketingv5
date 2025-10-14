import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AuthFormProps {
  onSuccess: () => void;
}

export const AuthForm = ({ onSuccess }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password || (!isLogin && !username)) {
      toast.error("Veuillez remplir tous les champs");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const users = JSON.parse(localStorage.getItem("max_users") || "[]");
        const user = users.find((u: any) => u.email === email && u.password === password);
        
        if (user) {
          localStorage.setItem("max_current_user", JSON.stringify(user));
          toast.success("Connexion réussie !");
          onSuccess();
        } else {
          toast.error("Email ou mot de passe incorrect");
        }
      } else {
        const users = JSON.parse(localStorage.getItem("max_users") || "[]");
        const existingUser = users.find((u: any) => u.email === email);
        
        if (existingUser) {
          toast.error("Cet email est déjà utilisé");
        } else {
          const newUser = { username, email, password, createdAt: new Date().toISOString() };
          users.push(newUser);
          localStorage.setItem("max_users", JSON.stringify(users));
          localStorage.setItem("max_current_user", JSON.stringify(newUser));
          toast.success("Compte créé avec succès !");
          onSuccess();
        }
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {!isLogin && (
          <div className="space-y-2">
            <Label htmlFor="username">Nom d'utilisateur</Label>
            <Input
              id="username"
              type="text"
              placeholder="Votre nom"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-secondary border-border"
              required={!isLogin}
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-secondary border-border"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-secondary border-border"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full gradient-primary font-semibold"
        disabled={loading}
      >
        {loading ? "Chargement..." : isLogin ? "Se connecter" : "Créer un compte"}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </form>
  );
};
