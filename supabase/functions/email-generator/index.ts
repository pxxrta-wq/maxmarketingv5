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
    const { product, objective, audience, tone, offer } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY non configurée');
    }

    const systemPrompt = `Tu es un expert en email marketing avec 15+ ans d'expérience. Tu crées des emails hautement performants (taux d'ouverture > 40%, CTR > 10%).

Ta mission : Créer un email marketing complet et optimisé.

Structure de l'email à générer :

**OBJET A/B :**
- Version A : [objet émotionnel/curiosité]
- Version B : [objet bénéfice/urgence]

**PRÉ-HEADER :**
[Texte d'aperçu optimisé - 50-90 caractères]

**CORPS DE L'EMAIL :**

H1: [Titre accrocheur]

Salut [Prénom],

[Hook émotionnel - 2-3 lignes max]

[Paragraphe principal - présenter le problème/solution]

**Bénéfices clés :**
✓ Bénéfice 1 - Impact concret
✓ Bénéfice 2 - Transformation
✓ Bénéfice 3 - Résultat mesurable

[Paragraphe de connexion émotionnelle]

[CALL TO ACTION PRINCIPAL]

[Note de réassurance/urgence]

[Signature personnalisée]

**VARIANTE DE TON :**
[Version alternative avec ton différent]

Applique les principes :
- Neuromarketing : FOMO, réciprocité, preuve sociale
- Storytelling transformationnel
- Clarté et concision (Flesch > 60)
- CTA visible et unique`;

    const userPrompt = `Produit/Service : ${product}
Objectif : ${objective}
Audience : ${audience}
${tone ? `Ton souhaité : ${tone}` : ''}
${offer ? `Offre/Bénéfice : ${offer}` : ''}

Génère un email marketing complet optimisé pour cette campagne.`;

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
    const emailContent = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ email: emailContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur dans email-generator:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
