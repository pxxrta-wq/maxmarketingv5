import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    // Collect all user data
    const exportData = {
      exported_at: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      },
      local_storage_data: {
        note: "Your browser's localStorage contains additional data that should be exported separately",
        items: [
          "max_current_user",
          "max_premium",
          "max_theme",
          "max_tracking",
          "max_email_history",
          "max_plan_history",
          "max_social_history",
          "max_chat_history",
        ]
      }
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="max-marketing-data-${user.id}.json"`
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error exporting user data:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
