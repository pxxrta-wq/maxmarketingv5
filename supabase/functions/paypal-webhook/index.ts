import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYPAL-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.json();
    logStep("Event received", { event_type: body.event_type });

    // Minimal PayPal webhook handling for subscription payments
    switch (body.event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        const subscriptionId = body.resource.id as string;
        const planName = body.resource.plan_id as string;
        const email = body.resource.subscriber?.email_address as string | undefined;

        if (!email) break;
        const { data: users } = await supabase.auth.admin.listUsers();
        const user = users?.users.find((u) => u.email === email);
        if (!user) break;

        await supabase.from("subscriptions").upsert(
          {
            user_id: user.id,
            provider: "paypal",
            paypal_subscription_id: subscriptionId,
            status: "active",
            plan_name: planName || "premium",
            price_amount: 1900,
            currency: "eur",
            current_period_start: new Date().toISOString(),
          },
          { onConflict: "paypal_subscription_id" }
        );
        break;
      }
      case "BILLING.SUBSCRIPTION.CANCELLED": {
        const subscriptionId = body.resource.id as string;
        await supabase
          .from("subscriptions")
          .update({ status: "canceled", canceled_at: new Date().toISOString() })
          .eq("paypal_subscription_id", subscriptionId);
        break;
      }
      case "PAYMENT.SALE.COMPLETED": {
        const sale = body.resource;
        const invoiceId = sale.id as string;
        const amount = Math.round(parseFloat(sale.amount.total) * 100);
        const currency = sale.amount.currency;
        const email = sale.payer?.payer_info?.email as string | undefined;

        if (email) {
          const { data: users } = await supabase.auth.admin.listUsers();
          const user = users?.users.find((u) => u.email === email);
          if (user) {
            const { data: subscription } = await supabase
              .from("subscriptions")
              .select("id")
              .eq("user_id", user.id)
              .eq("provider", "paypal")
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            await supabase.from("payment_transactions").insert({
              user_id: user.id,
              subscription_id: subscription?.id,
              provider: "paypal",
              provider_transaction_id: invoiceId,
              amount,
              currency,
              status: "completed",
              payment_method: "paypal",
              metadata: { raw: sale },
            });
          }
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR processing PayPal webhook", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
