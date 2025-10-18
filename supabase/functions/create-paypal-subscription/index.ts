import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYPAL-CHECKOUT] ${step}${detailsStr}`);
};

async function getPayPalAccessToken(clientId: string, secret: string, base: string) {
  const auth = btoa(`${clientId}:${secret}`);
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal token error: ${res.status}`);
  const json = await res.json();
  return json.access_token as string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const secret = Deno.env.get("PAYPAL_SECRET");
    const planId = Deno.env.get("PAYPAL_PLAN_ID");
    if (!clientId || !secret || !planId) throw new Error("Missing PAYPAL envs");

    const isLive = (Deno.env.get("PAYPAL_ENV") || "sandbox").toLowerCase() === "live";
    const base = isLive ? "https://api.paypal.com" : "https://api.sandbox.paypal.com";

    const accessToken = await getPayPalAccessToken(clientId, secret, base);

    const origin = req.headers.get("origin") || "http://localhost:5173";

    // Create subscription
    const res = await fetch(`${base}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: planId,
        subscriber: { email_address: user.email },
        application_context: {
          brand_name: "Max Marketing",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${origin}/payment-success`,
          cancel_url: `${origin}/payment-cancel`,
        },
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`PayPal create subscription error: ${res.status} ${text}`);
    }
    const json = await res.json();

    // Find approval link
    const approve = (json.links as any[]).find((l) => l.rel === "approve");

    return new Response(JSON.stringify({ url: approve?.href }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating PayPal subscription:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
