import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user (no premium required for social generator)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { topic } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY non configurée');
    }

    const systemPrompt = `Tu es un expert viral marketing qui crée du contenu social hautement engageant.

Ta mission : Générer 4 versions d'un post pour LinkedIn, Instagram, TikTok et Facebook, puis expliquer pourquoi ce contenu peut devenir viral.

Format de réponse STRICT :

=== LINKEDIN ===
[Post professionnel avec storytelling, 1300-2000 caractères]
- Hook puissant (première ligne)
- Storytelling avec arc narratif
- Enseignements actionnables
- CTA de discussion
Hashtags : #hashtag1 #hashtag2 #hashtag3

=== INSTAGRAM ===
[Post visuel émotionnel, 800-1200 caractères]
- Ouverture émotionnelle
- Storytelling visuel
- Transformation/inspiration
- CTA engagement
Hashtags : [15-20 hashtags pertinents]

=== TIKTOK ===
[Script vidéo viral, format hook-contenu-conclusion]
**Hook (3 premières secondes) :**
[Phrase ultra-accrocheuse]

**Contenu (15-30 secondes) :**
[Script scène par scène]

**Conclusion (5 secondes) :**
[CTA clair]

**Texte overlay :** [Textes à afficher]
**Son recommandé :** [Type de son]
Hashtags : #hashtag1 #hashtag2 #hashtag3

=== FACEBOOK ===
[Post communautaire récit, 1000-1500 caractères]
- Introduction personnelle/relatable
- Récit détaillé avec émotions
- Leçons apprises
- Invitation à partager expériences
CTA : [Question engageante]

=== POURQUOI CE CONTENU PEUT DEVENIR VIRAL ===
**Psychologie de la viralité :**
- [Mécanisme émotionnel 1]
- [Mécanisme émotionnel 2]
- [Mécanisme émotionnel 3]

**Effet Zeigarnik :** [Comment le contenu crée tension/curiosité]

**Transformation :** [Avant → Après du lecteur]

**Shareability :** [Pourquoi on voudra le partager]

Principes appliqués :
- Émotions primaires (surprise, joie, inspiration)
- Storytelling transformationnel
- Vulnérabilité authentique
- Valeur actionnable
- CTA naturels
- Pattern interrupts`;

    const userPrompt = `Sujet du post : ${topic}

Génère 4 versions de contenu social viral (LinkedIn, Instagram, TikTok, Facebook) puis explique la mécanique de viralité.`;

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
        temperature: 0.95,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API AI:', response.status, errorText);
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    const fullContent = data.choices[0].message.content;

    // Parse le contenu pour extraire chaque section
    const parseContent = (content: string) => {
      const sections = {
        linkedin: '',
        instagram: '',
        tiktok: '',
        facebook: '',
        explanation: ''
      };

      const linkedinMatch = content.match(/=== LINKEDIN ===([\s\S]*?)(?==== INSTAGRAM ===|$)/i);
      const instagramMatch = content.match(/=== INSTAGRAM ===([\s\S]*?)(?==== TIKTOK ===|$)/i);
      const tiktokMatch = content.match(/=== TIKTOK ===([\s\S]*?)(?==== FACEBOOK ===|$)/i);
      const facebookMatch = content.match(/=== FACEBOOK ===([\s\S]*?)(?==== POURQUOI|$)/i);
      const explanationMatch = content.match(/=== POURQUOI CE CONTENU PEUT DEVENIR VIRAL ===([\s\S]*?)$/i);

      if (linkedinMatch) sections.linkedin = linkedinMatch[1].trim();
      if (instagramMatch) sections.instagram = instagramMatch[1].trim();
      if (tiktokMatch) sections.tiktok = tiktokMatch[1].trim();
      if (facebookMatch) sections.facebook = facebookMatch[1].trim();
      if (explanationMatch) sections.explanation = explanationMatch[1].trim();

      return sections;
    };

    const parsedContent = parseContent(fullContent);

    return new Response(
      JSON.stringify({ content: parsedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur dans social-generator:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
