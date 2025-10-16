import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check } from "lucide-react";
import { toast } from "sonner";
import { usePremium } from "@/hooks/usePremium";

export type Theme = {
  id: string;
  name: string;
  isPremium: boolean;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    accent: string;
  };
};

export const themes: Theme[] = [
  {
    id: "dark-orange",
    name: "Noir & Orange",
    isPremium: false,
    colors: {
      background: "217 33% 8%",
      foreground: "0 0% 98%",
      primary: "17 100% 60%",
      accent: "17 100% 60%",
    },
  },
  {
    id: "light-orange",
    name: "Blanc & Orange",
    isPremium: false,
    colors: {
      background: "0 0% 100%",
      foreground: "222 47% 11%",
      primary: "17 100% 60%",
      accent: "17 100% 60%",
    },
  },
  {
    id: "light-green",
    name: "Blanc & Vert",
    isPremium: true,
    colors: {
      background: "0 0% 100%",
      foreground: "222 47% 11%",
      primary: "142 76% 36%",
      accent: "142 76% 36%",
    },
  },
  {
    id: "purple-white",
    name: "Violet & Blanc",
    isPremium: true,
    colors: {
      background: "270 60% 50%",
      foreground: "0 0% 100%",
      primary: "0 0% 100%",
      accent: "270 60% 70%",
    },
  },
  {
    id: "green-dark",
    name: "Vert & Noir",
    isPremium: true,
    colors: {
      background: "217 33% 8%",
      foreground: "0 0% 98%",
      primary: "142 76% 36%",
      accent: "142 76% 36%",
    },
  },
  {
    id: "purple-dark",
    name: "Violet & Noir",
    isPremium: true,
    colors: {
      background: "217 33% 8%",
      foreground: "0 0% 98%",
      primary: "270 60% 60%",
      accent: "270 60% 60%",
    },
  },
];

export const ThemeSelector = () => {
  const isPremium = usePremium();
  const [currentTheme, setCurrentTheme] = useState("dark-orange");

  useEffect(() => {
    const savedTheme = localStorage.getItem("max_theme") || "dark-orange";
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;
    root.style.setProperty("--background", theme.colors.background);
    root.style.setProperty("--foreground", theme.colors.foreground);
    root.style.setProperty("--primary", theme.colors.primary);
    root.style.setProperty("--accent", theme.colors.accent);
    
    // Update gradient with new primary color
    root.style.setProperty(
      "--gradient-primary",
      `linear-gradient(135deg, hsl(${theme.colors.primary}) 0%, hsl(${theme.colors.primary}) 100%)`
    );
  };

  const handleThemeChange = (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    if (!theme) return;

    if (theme.isPremium && !isPremium) {
      toast.error("Ce thème est réservé aux membres Premium 💎", {
        description: "Passez à Premium pour débloquer tous les thèmes exclusifs",
        action: {
          label: "Passer Premium",
          onClick: () => (window.location.href = "/premium"),
        },
      });
      return;
    }

    setCurrentTheme(themeId);
    applyTheme(themeId);
    localStorage.setItem("max_theme", themeId);
    toast.success(`Thème "${theme.name}" appliqué avec succès !`);
  };

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-semibold mb-4">Sélecteur de Thème</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeChange(theme.id)}
            className={`relative p-4 rounded-lg border-2 transition-all ${
              currentTheme === theme.id
                ? "border-primary shadow-lg scale-105"
                : "border-border hover:border-primary/50 hover:scale-102"
            }`}
          >
            {theme.isPremium && (
              <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-purple-500 text-white text-xs">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-full h-12 rounded flex overflow-hidden shadow-md">
                <div
                  className="w-1/2"
                  style={{ backgroundColor: `hsl(${theme.colors.background})` }}
                />
                <div
                  className="w-1/2"
                  style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                />
              </div>
              
              <div className="text-center">
                <p className="font-medium text-sm">{theme.name}</p>
                {currentTheme === theme.id && (
                  <div className="flex items-center justify-center gap-1 text-primary text-xs mt-1">
                    <Check className="w-3 h-3" />
                    Actif
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};
