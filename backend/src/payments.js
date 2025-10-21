import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { getUserById, query, upsertSubscription, logWebhook } from './db.js';
import { requireAuth } from './middleware.js';

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', requireAuth, async (req, res) => {
  const user = await getUserById(req.user.sub);
  if (!user) return res.status(401).json({ error: 'Not found' });
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    customer_email: user.email,
    success_url: `${process.env.DOMAIN}/payment-success`,
    cancel_url: `${process.env.DOMAIN}/payment-cancel`
  });
  res.json({ id: session.id, url: session.url });
});

router.post('/webhook/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const eventId = event.id;
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const email = session.customer_details?.email;
      const customerId = session.customer;
      if (email) {
        const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = rows[0];
        if (user) {
          await query('UPDATE users SET is_premium = true, premium_since = now(), stripe_customer_id = COALESCE($2, stripe_customer_id) WHERE id = $1', [user.id, customerId]);
          // Send welcome email
          try {
            const { sendEmail } = await import('./email.js');
            await sendEmail({ to: user.email, subject: 'Bienvenue Premium', text: 'Merci pour votre abonnement Premium à Max Marketing.' });
          } catch {}
        }
      }
    } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
      const sub = event.data.object;
      const customerId = sub.customer;
      const status = sub.status;
      const currentPeriodEnd = new Date(sub.current_period_end * 1000);
      const { rows } = await query('SELECT * FROM users WHERE stripe_customer_id = $1', [customerId]);
      const user = rows[0];
      if (user) {
        await upsertSubscription({ userId: user.id, provider: 'stripe', providerSubscriptionId: sub.id, status, currentPeriodEnd });
        await query('UPDATE users SET is_premium = $1 WHERE id = $2', [status === 'active' || status === 'trialing', user.id]);
      }
    }
    await logWebhook({ provider: 'stripe', eventId, payload: event, status: 'processed' });
  } catch (e) {
    console.error('webhook error', e);
    await logWebhook({ provider: 'stripe', eventId, payload: event, status: 'error' });
  }

  res.json({ received: true });
});

router.get('/subscription-status', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const user = await getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ is_premium: user.is_premium, premium_since: user.premium_since });
});

export default router;
