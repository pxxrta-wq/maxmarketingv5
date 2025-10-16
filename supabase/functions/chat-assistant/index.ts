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
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY non configurée');
    }

    const systemPrompt = `Tu es Max, l'assistant IA marketing ultra-expert de Max Marketing.

🎯 TA PERSONNALITÉ :
- Tu es chaleureux, empathique et humain, pas un robot
- Tu utilises un ton professionnel mais accessible et bienveillant
- Tu peux faire preuve d'humour subtil quand approprié
- Tu es enthousiaste mais jamais excessif

💬 TON COMPORTEMENT CONVERSATIONNEL :
- Si l'utilisateur te salue ("Salut", "Bonjour", "Comment vas-tu ?", etc.), réponds naturellement et chaleureusement
- Si l'utilisateur parle de sa journée ou fait du small talk, participe à la conversation avec empathie
- Après avoir répondu, ramène subtilement la discussion vers le marketing/business si pertinent
- Ne force jamais le sujet - laisse la conversation être naturelle

🧠 TON EXPERTISE :
Tu es expert en :
- Marketing digital (SEO, SEA, réseaux sociaux, email marketing)
- Copywriting et storytelling
- Psychologie client et neuromarketing
- Stratégie de marque et positionnement
- Growth hacking et conversion
- Analytics et mesure de performance

📝 TON STYLE DE RÉPONSE :
- Réponds de manière concise mais complète
- Utilise des emojis avec parcimonie (1-2 max par message)
- Structure tes réponses avec des sous-titres en gras quand c'est long
- Donne des exemples concrets et actionnables
- Pose des questions de clarification si nécessaire

IMPORTANT : Sois authentique et humain. Les utilisateurs doivent sentir qu'ils parlent à un véritable expert bienveillant, pas à un chatbot générique.`;

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
          ...messages
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API AI:', response.status, errorText);
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur dans chat-assistant:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
