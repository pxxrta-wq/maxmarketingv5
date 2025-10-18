import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("EMAIL_FROM") || "noreply@maxmarketing.com";
  if (!apiKey) {
    logStep("RESEND_API_KEY missing - skipping email", { to, subject });
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) {
    const text = await res.text();
    logStep("ERROR sending email", { status: res.status, text });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    logStep("ERROR: No signature header");
    return new Response("No signature", { status: 400 });
  }

  const body = await req.text();
  
  try {
    logStep("Webhook received");
    
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret!
    );
    
    logStep("Event verified", { type: event.type, id: event.id });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", { sessionId: session.id, customerId: session.customer });

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        
        // Find user by customer email
        const customerEmail = session.customer_email || session.customer_details?.email;
        if (!customerEmail) {
          logStep("ERROR: No customer email found");
          break;
        }

        const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
        const user = userData?.users.find(u => u.email === customerEmail);
        
        if (!user) {
          logStep("ERROR: User not found", { email: customerEmail });
          break;
        }

        // Create or update subscription record
        const { error: subError } = await supabase
          .from("subscriptions")
          .upsert({
            user_id: user.id,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            provider: "stripe",
            status: subscription.status as any,
            plan_name: "premium",
            price_amount: 1900,
            currency: "eur",
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          }, {
            onConflict: "stripe_subscription_id"
          });

        if (subError) {
          logStep("ERROR creating subscription", { error: subError });
        } else {
          logStep("Subscription created successfully");
        }

        // Create transaction record
        await supabase.from("payment_transactions").insert({
          user_id: user.id,
          provider: "stripe",
          provider_transaction_id: session.id,
          amount: session.amount_total || 1900,
          currency: session.currency || "eur",
          status: "completed",
          payment_method: session.payment_method_types?.[0] || "card",
          metadata: { session_id: session.id }
        });

        logStep("Transaction recorded");

        // Send welcome email
        await sendEmail(
          customerEmail,
          "Bienvenue dans Max Marketing Premium ✨",
          `<h2>Bienvenue !</h2><p>Votre abonnement Premium est actif. Vous avez maintenant accès à toutes les fonctionnalités.</p><p>Accédez à votre tableau de bord: <a href="${(session.success_url ?? '').split('?')[0] || 'https://app.maxmarketing.com/dashboard'}">Ouvrir Max Marketing</a></p>`
        );
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription updated", { id: subscription.id, status: subscription.status });

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: subscription.status as any,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) logStep("ERROR updating subscription", { error });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", { id: subscription.id });

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) logStep("ERROR canceling subscription", { error });
        // Attempt to send cancellation email
        try {
          const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
          if (customerId) {
            const customer = await stripe.customers.retrieve(customerId);
            const email = (customer as any)?.email as string | undefined;
            if (email) {
              await sendEmail(
                email,
                "Abonnement annulé - Max Marketing",
                `<p>Votre abonnement a été annulé. Vous conservez l'accès jusqu'au ${(subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toLocaleDateString('fr-FR') : 'fin de période')}.</p>`
              );
            }
          }
        } catch (e) {
          logStep("ERROR sending cancellation email", { error: e instanceof Error ? e.message : String(e) });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Payment succeeded", { invoiceId: invoice.id });

        // Find subscription by stripe subscription ID
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("user_id, id")
          .eq("stripe_subscription_id", invoice.subscription as string)
          .single();

        if (subscription) {
          await supabase.from("payment_transactions").insert({
            user_id: subscription.user_id,
            subscription_id: subscription.id,
            provider: "stripe",
            provider_transaction_id: invoice.id,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: "completed",
            payment_method: "card",
            metadata: { invoice_id: invoice.id }
          });
          // Email receipt if customer email available
          const email = invoice.customer_email || invoice.customer_address?.email;
          if (email) {
            await sendEmail(
              email,
              "Paiement reçu - Max Marketing Premium",
              `<p>Merci pour votre paiement de ${(invoice.amount_paid / 100).toFixed(2)} ${invoice.currency?.toUpperCase()}.</p><p>Votre abonnement reste actif.</p>`
            );
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Payment failed", { invoiceId: invoice.id });

        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("user_id, id")
          .eq("stripe_subscription_id", invoice.subscription as string)
          .single();

        if (subscription) {
          await supabase
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("id", subscription.id);

          await supabase.from("payment_transactions").insert({
            user_id: subscription.user_id,
            subscription_id: subscription.id,
            provider: "stripe",
            provider_transaction_id: invoice.id,
            amount: invoice.amount_due,
            currency: invoice.currency,
            status: "failed",
            metadata: { invoice_id: invoice.id }
          });
          const email = invoice.customer_email || invoice.customer_address?.email;
          if (email) {
            await sendEmail(
              email,
              "Échec de paiement - Max Marketing Premium",
              `<p>Le paiement de ${(invoice.amount_due / 100).toFixed(2)} ${invoice.currency?.toUpperCase()} a échoué. Veuillez mettre à jour votre moyen de paiement depuis le portail client Stripe.</p>`
            );
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR processing webhook", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
