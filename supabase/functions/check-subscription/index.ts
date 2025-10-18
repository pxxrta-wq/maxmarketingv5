import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
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
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Check subscription in database using security definer function
    const { data: hasActive, error: checkError } = await supabaseClient
      .rpc('has_active_subscription', { user_id_param: user.id });

    if (checkError) {
      logStep("ERROR checking subscription", { error: checkError });
      throw checkError;
    }

    // Consider trialing as active for access purposes
    let subscribed = !!hasActive;
    let subscriptionEnd: string | null = null;

    if (!subscribed) {
      const { data: trialSub } = await supabaseClient
        .from('subscriptions')
        .select('status,current_period_end')
        .eq('user_id', user.id)
        .eq('status', 'trialing')
        .gt('current_period_end', new Date().toISOString())
        .maybeSingle();

      if (trialSub) {
        subscribed = true;
        subscriptionEnd = trialSub.current_period_end as any;
        logStep('Trialing subscription detected', { endDate: subscriptionEnd });
      }
    }

    if (!subscriptionEnd && subscribed) {
      const { data: activeSub } = await supabaseClient
        .from('subscriptions')
        .select('current_period_end')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .order('current_period_end', { ascending: false })
        .limit(1)
        .maybeSingle();
      subscriptionEnd = activeSub?.current_period_end ?? null;
    }

    if (!subscribed) {
      logStep("No active or trialing subscription found");
    }

    return new Response(JSON.stringify({
      subscribed,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage, subscribed: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
