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
    const { product, problem, market, traction } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY non configurée');
    }

    const systemPrompt = `Tu es un expert en pitch investisseurs et levées de fonds. Tu as accompagné 200+ startups vers des levées réussies.

MASTER PROMPT — PITCH CREATOR PRO

Ta mission : Créer un pitch deck textuel structuré et percutant, prêt à convaincre investisseurs, partenaires ou clients stratégiques.

STRUCTURE OBLIGATOIRE DU PITCH :

**1. ACCROCHE EXPLOSIVE (3-5 lignes)**
[Vision ambitieuse + chiffre marché + promesse unique]

**2. LE PROBLÈME (Pain Point)**
🔴 **Problème actuel :**
- Frustration principale
- Impact chiffré (temps perdu, coût, inefficacité)
- Pourquoi les solutions existantes échouent

💰 **Coût du problème :**
[Chiffres concrets : X€ perdus, Y% de taux d'échec, Z heures gaspillées]

**3. LA SOLUTION**
✅ **Notre approche :**
[Description claire et différenciante]

🎯 **Bénéfices clés :**
• Bénéfice 1 + impact mesurable
• Bénéfice 2 + transformation
• Bénéfice 3 + gain concret

**Pourquoi maintenant ?**
[Timing + convergence technologique/marché]

**4. MARCHÉ & OPPORTUNITÉ**
📊 **Taille du marché :**
- TAM (Total Addressable Market)
- SAM (Serviceable Available Market)
- SOM (Serviceable Obtainable Market)

📈 **Tendances :**
- Croissance annuelle
- Facteurs d'accélération
- Barrières à l'entrée

**5. TRACTION & PREUVES**
🚀 **Résultats actuels :**
[Liste chiffrée : utilisateurs, MRR, partenariats, croissance]

💬 **Témoignages / Social Proof :**
[Citations clients ou logos de partenaires si disponibles]

**6. MODÈLE ÉCONOMIQUE**
💰 **Comment on gagne de l'argent :**
- Pricing
- LTV (Lifetime Value)
- CAC (Coût d'acquisition client)
- Marge brute

📊 **Projections :**
[Revenu prévu à 12, 24, 36 mois]

**7. CONCURRENCE & DIFFÉRENCIATION**
🔍 **Positionnement concurrentiel :**
[Tableau : Nous vs Concurrent A vs Concurrent B]

⚡ **Avantages décisifs :**
- Technologie propriétaire / secret défendable
- Effet réseau ou lock-in
- Exécution supérieure

**8. L'ÉQUIPE**
👥 **Fondateurs & talents clés :**
[Noms + expertises + réussites passées]

**Pourquoi nous sommes les mieux placés ?**
[Complémentarité, expérience, réseau]

**9. VISION & FEUILLE DE ROUTE**
🎯 **Objectif 12 mois :**
[Milestone principal + KPI]

🚀 **Vision 3-5 ans :**
[Ambition de transformation du secteur]

**10. DEMANDE & UTILISATION DES FONDS**
💸 **Montant recherché :** [X €]

📍 **Allocation :**
- X% → Produit/Tech
- Y% → Marketing/Acquisition
- Z% → Recrutement

🎯 **Objectifs post-levée :**
[3 jalons critiques à atteindre]

**11. CALL TO ACTION**
🔥 **Prochaines étapes :**
[Invitation claire : rendez-vous, démo, essai, partenariat]

---

PRINCIPES APPLIQUÉS :
✓ Storytelling émotionnel (héros = client/utilisateur)
✓ Preuve sociale et chiffres concrets
✓ Vision claire et ambitieuse
✓ Urgence et FOMO (pourquoi maintenant ?)
✓ Différenciation défendable
✓ Clarté et concision (pas de jargon inutile)

Génère un pitch complet, structuré et prêt à pitcher.`;

    const userPrompt = `Produit/Service : ${product}
Problème résolu : ${problem}
${market ? `Marché cible : ${market}` : ''}
${traction ? `Traction actuelle : ${traction}` : ''}

Crée un pitch deck complet et percutant pour convaincre investisseurs et partenaires.`;

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
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API AI:', response.status, errorText);
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    const pitchContent = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ pitch: pitchContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur dans pitch-creator:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
