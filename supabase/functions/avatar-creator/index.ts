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
    const { business, product, goal } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY non configurée');
    }

    const systemPrompt = `Tu es un expert en psychologie du consommateur, segmentation client et stratégie marketing. Tu as analysé 1000+ marchés et créé des centaines d'avatars clients ultra-précis.

MASTER PROMPT — AVATAR CLIENT IDÉAL UNIVERSEL

Ta mission : Créer un profil détaillé du client idéal pour ce business, exploitable immédiatement pour le marketing, les ventes et le produit.

STRUCTURE COMPLÈTE DE L'AVATAR :

**1. PROFIL DÉMOGRAPHIQUE**
👤 **Identité de base :**
- Nom fictif + âge
- Localisation (ville/région)
- Situation familiale
- Profession / secteur d'activité
- Revenus annuels (fourchette)
- Niveau d'éducation

**2. PROFIL PSYCHOGRAPHIQUE**
🧠 **Personnalité & Valeurs :**
- Traits de caractère dominants (3-5)
- Valeurs profondes (ce qui compte vraiment pour lui/elle)
- Aspirations et rêves
- Peurs et blocages

🎯 **Centres d'intérêt & Habitudes :**
- Hobbies et passions
- Média consommés (réseaux sociaux, podcasts, blogs)
- Routine quotidienne type
- Où passe-t-il son temps libre ?

**3. PAIN POINTS (PROBLÈMES & FRUSTRATIONS)**
🔴 **Problèmes principaux :**
1. [Frustration majeure liée au produit/service]
2. [Problème secondaire mais bloquant]
3. [Frustration émotionnelle ou sociale]

💭 **Ce qu'il se dit dans sa tête :**
"[Citation mentale interne représentant sa frustration]"

💰 **Impact de ces problèmes :**
[Temps perdu, argent gaspillé, stress, opportunités manquées]

**4. MOTIVATIONS & DÉSIRS**
✅ **Ce qu'il recherche vraiment :**
- Bénéfice rationnel (gain concret)
- Bénéfice émotionnel (se sentir comment ?)
- Bénéfice social (statut, reconnaissance)

🎁 **Résultat idéal souhaité :**
[Vision de transformation : "Je veux passer de X à Y"]

**5. PARCOURS D'ACHAT & COMPORTEMENTS**
🛒 **Comment il prend ses décisions d'achat :**
- Déclencheur initial (qu'est-ce qui le pousse à chercher ?)
- Sources d'information consultées
- Critères de décision prioritaires (prix, qualité, rapidité, confiance)
- Freins à l'achat
- Temps moyen de réflexion avant achat

📱 **Canaux préférés :**
- Réseaux sociaux actifs
- Type de contenu consommé
- Meilleurs moments de contact

**6. OBJECTIONS TYPIQUES**
❌ **Pourquoi il pourrait dire NON :**
1. [Objection principale]
2. [Doute secondaire]
3. [Frein psychologique]

✅ **Comment lever ces objections :**
[Arguments de réassurance + preuves sociales nécessaires]

**7. MESSAGES CLÉS À UTILISER**
💬 **Ton de communication optimal :**
[Formel/Décontracté, Technique/Simple, Inspirant/Pragmatique]

🎯 **Phrases d'accroche qui résonnent :**
- "[Phrase 1 qui parle directement à son problème]"
- "[Phrase 2 qui active son désir]"
- "[Phrase 3 avec bénéfice émotionnel]"

📢 **Storytelling type :**
[Arc narratif recommandé : problème → solution → transformation]

**8. POSITIONNEMENT CONCURRENTIEL**
🔍 **Solutions actuelles utilisées :**
- Que fait-il aujourd'hui pour résoudre son problème ?
- Pourquoi ces solutions sont insuffisantes ?

⚡ **Pourquoi choisir VOTRE offre :**
[Arguments différenciants alignés avec ses critères de décision]

**9. CYCLE DE VIE CLIENT**
🚀 **Onboarding idéal :**
[Première expérience critique pour l'activer]

📈 **Opportunités d'upsell / cross-sell :**
[Produits/services complémentaires qu'il pourrait acheter]

💎 **Indicateurs de client VIP :**
[Signaux montrant qu'il deviendra un ambassadeur]

**10. INSIGHTS ACTIONNABLES**
✅ **Actions marketing prioritaires :**
1. [Canal #1 à exploiter + type de contenu]
2. [Partenariat ou influence à viser]
3. [Offre irrésistible à créer pour cet avatar]

🎯 **KPI de succès pour cet avatar :**
- Taux de conversion attendu
- Panier moyen
- LTV (Lifetime Value estimée)

---

PRINCIPES APPLIQUÉS :
✓ Profondeur psychologique (pas juste des données démographiques)
✓ Empathie et humanisation (on doit "sentir" cette personne)
✓ Insights actionnables (chaque élément doit servir le marketing/vente)
✓ Langage clair et vivant
✓ Basé sur des comportements réels observables

Génère un avatar client complet, vivant et exploitable.`;

    const userPrompt = `Activité : ${business}
Produit/Service : ${product}
${goal ? `Objectif principal : ${goal}` : ''}

Crée un avatar client idéal ultra-détaillé pour cette entreprise.`;

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
        temperature: 0.88,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API AI:', response.status, errorText);
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    const avatarContent = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ avatar: avatarContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur dans avatar-creator:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
