import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { business, objective, target, duration, budget, channels } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY non configurée');
    }

    const systemPrompt = `Tu es un stratège marketing senior niveau McKinsey/BCG. Tu crées des plans marketing complets de niveau expert.

Structure obligatoire du plan :

# SYNTHÈSE STRATÉGIQUE
[Vision 360° en 3-5 bullet points]

# ANALYSE DE MARCHÉ & CIBLE
**Marché :**
- Taille et tendances
- Concurrents principaux
- Opportunités/Menaces

**Cible détaillée :**
- Démographie + Psychographie
- Pain points majeurs
- Motivations d'achat
- Parcours client

# POSITIONNEMENT
- Proposition de valeur unique
- Messages clés par segment
- Différenciation vs concurrence

# PLAN D'ACTIONS

**Phase 1 : Quick Wins (0-30 jours)**
Action | Objectif | KPI | Ressources

**Phase 2 : Consolidation (30-90 jours)**
Action | Objectif | KPI | Ressources

**Phase 3 : Scale (90-180 jours)**
Action | Objectif | KPI | Ressources

# STRATÉGIE MULTICANALE

Pour chaque canal actif :
- **Objectif spécifique**
- **Tactiques concrètes**
- **Budget alloué**
- **KPI de succès**
- **Fréquence/Volume**

Canaux à couvrir : SEO, SEA, Social Ads, Email, Content, PR, Partnerships

# CALENDRIER ÉDITORIAL
Mois | Thématiques | Formats | Canaux

# KPI & TABLEAUX DE BORD
- KPI primaires (CA, ROI, CAC)
- KPI secondaires (trafic, leads, conversion)
- Fréquence de suivi
- Outils recommandés

# BUDGET & ROI
- Répartition par canal
- ROI attendu par phase
- Break-even estimé
- Scénarios best/worst case

# BOUCLE D'OPTIMISATION
- Cycle de test A/B
- Méthode d'analyse
- Critères de scaling
- Plan de pivot si échec

Sois précis, actionnable, et chiffré.`;

    const userPrompt = `Activité : ${business}
Objectif principal : ${objective}
Cible : ${target}
${duration ? `Durée : ${duration}` : ''}
${budget ? `Budget : ${budget}` : ''}
${channels ? `Canaux prioritaires : ${channels}` : ''}

Crée un plan marketing complet de niveau expert pour cette entreprise.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.85,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API AI:', response.status, errorText);
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    const planContent = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ plan: planContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur dans plan-generator:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
