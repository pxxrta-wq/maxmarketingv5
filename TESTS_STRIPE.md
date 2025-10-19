# 🧪 Guide de Tests Stripe - Max Marketing

## 🔧 Configuration Stripe CLI

### Installation
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_1.21.8_linux_x86_64.tar.gz
tar -xvf stripe_1.21.8_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/

# Windows
scoop install stripe
```

### Configuration
```bash
# 1. Login
stripe login

# 2. Écouter les webhooks locaux (DEV)
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

# 3. Récupérer le webhook secret (whsec_xxx)
# Copier et ajouter comme STRIPE_WEBHOOK_SECRET dans Supabase

# 4. Pour production, configurer dans Stripe Dashboard:
# Developers → Webhooks → Add endpoint
# URL: https://bkurhudbqvdzhjjynqyi.supabase.co/functions/v1/stripe-webhook
# Événements: checkout.session.completed, customer.subscription.*, invoice.*
```

---

## 💳 Cartes de Test Stripe

### ✅ Paiement Réussi
```
Numéro: 4242 4242 4242 4242
Expiration: 12/30 (ou toute date future)
CVV: 123
Code postal: 12345
```

### ❌ Paiement Refusé
```
Numéro: 4000 0000 0000 0002
Expiration: 12/30
CVV: 123
```

### 🔐 SCA Requis (3D Secure)
```
Numéro: 4000 0025 0000 3155
Expiration: 12/30
CVV: 123
→ Authentification requise (simuler succès ou échec)
```

### 💰 Insufficient Funds
```
Numéro: 4000 0000 0000 9995
Expiration: 12/30
CVV: 123
```

### 🚫 Carte Expirée
```
Numéro: 4000 0000 0000 0069
Expiration: 12/20 (passée)
CVV: 123
```

---

## 🧪 Scénarios de Test

### ✅ TEST 1: Inscription + Checkout Réussi
```bash
# 1. Créer un compte
curl -X POST https://bkurhudbqvdzhjjynqyi.supabase.co/auth/v1/signup \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test1234"}'

# 2. Aller sur /premium et cliquer "Passer en Premium"
# 3. Utiliser carte 4242 4242 4242 4242
# 4. Vérifier redirection vers /payment-success

# ✅ Attendu:
# - Abonnement créé avec status "trialing"
# - Email de bienvenue envoyé
# - Accès premium débloqué immédiatement
# - current_period_end = +7 jours
```

### 🔄 TEST 2: Renouvellement Mensuel
```bash
# Simuler un paiement récurrent
stripe trigger invoice.payment_succeeded

# ✅ Attendu:
# - Transaction enregistrée dans payment_transactions
# - Email de confirmation envoyé
# - current_period_end prolongé de 30 jours
```

### ❌ TEST 3: Échec de Paiement
```bash
# Simuler un échec de paiement
stripe trigger invoice.payment_failed

# ✅ Attendu:
# - Statut passe à "past_due"
# - Transaction avec status "failed"
# - Email d'alerte envoyé à l'utilisateur
```

### 🚫 TEST 4: Annulation d'Abonnement
```bash
# Via Stripe Customer Portal ou API
stripe subscriptions cancel sub_xxx

# Ou via webhook trigger:
stripe trigger customer.subscription.deleted

# ✅ Attendu:
# - Statut passe à "canceled"
# - canceled_at rempli
# - Email de confirmation d'annulation
# - Accès premium maintenu jusqu'à current_period_end
```

### 🔐 TEST 5: Trial Expiration
```bash
# Modifier manuellement current_period_end en DB pour simuler expiration
UPDATE subscriptions 
SET current_period_end = NOW() - INTERVAL '1 day', status = 'active'
WHERE user_id = 'xxx';

# Appeler check-subscription
# ✅ Attendu:
# - Subscription détectée comme expirée
# - Accès premium bloqué
```

---

## 📊 Vérifications en Base de Données

### Voir tous les abonnements
```sql
SELECT 
  u.email,
  s.status,
  s.provider,
  s.price_amount / 100.0 AS price_eur,
  s.current_period_start,
  s.current_period_end,
  s.cancel_at_period_end
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
ORDER BY s.created_at DESC;
```

### Voir transactions récentes
```sql
SELECT 
  pt.created_at,
  u.email,
  pt.amount / 100.0 AS amount_eur,
  pt.status,
  pt.provider,
  pt.payment_method
FROM payment_transactions pt
JOIN auth.users u ON pt.user_id = u.id
ORDER BY pt.created_at DESC
LIMIT 20;
```

### Vérifier utilisateurs premium actifs
```sql
SELECT COUNT(*) as premium_users
FROM subscriptions
WHERE status IN ('active', 'trialing')
  AND (current_period_end IS NULL OR current_period_end > NOW());
```

### Calculer MRR (Monthly Recurring Revenue)
```sql
SELECT 
  SUM(price_amount) / 100.0 AS mrr_eur
FROM subscriptions
WHERE status IN ('active', 'trialing');
```

---

## 🔍 Debugging Webhooks

### Voir logs Stripe en temps réel
```bash
# Filtrer par type d'événement
stripe logs tail --filter-events customer.subscription.*

# Filtrer par statut
stripe logs tail --filter-http-status 500

# Voir tous les logs
stripe logs tail
```

### Tester webhook manuellement
```bash
# Simuler checkout réussi
stripe trigger checkout.session.completed

# Simuler mise à jour abonnement
stripe trigger customer.subscription.updated

# Simuler annulation
stripe trigger customer.subscription.deleted

# Simuler paiement réussi
stripe trigger invoice.payment_succeeded

# Simuler échec paiement
stripe trigger invoice.payment_failed
```

### Vérifier signature webhook
```bash
# Dans stripe-webhook/index.ts, ajouter temporairement:
console.log('Webhook signature:', signature);
console.log('Webhook secret:', webhookSecret);
console.log('Raw body:', body.substring(0, 100));

# Puis vérifier logs Supabase:
stripe logs tail | grep "STRIPE-WEBHOOK"
```

---

## ⚡ Tests de Performance

### Test charge Checkout
```bash
# Utiliser k6 ou Apache Bench
k6 run - <<EOF
import http from 'k6/http';

export default function() {
  const url = 'https://bkurhudbqvdzhjjynqyi.supabase.co/functions/v1/create-checkout';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  };
  http.post(url, JSON.stringify({}), { headers });
}
EOF

# ✅ Objectif: < 500ms p95, 0% erreurs
```

### Test webhooks
```bash
# Simuler 100 webhooks simultanés
for i in {1..100}; do
  stripe trigger checkout.session.completed &
done
wait

# ✅ Vérifier dans Supabase logs:
# - Tous traités avec succès
# - Aucune duplication
# - < 2s de traitement max
```

---

## 🛡️ Tests de Sécurité

### ❌ TEST: Accès non-authentifié
```bash
# Tenter d'accéder aux edge functions sans token
curl -X POST https://bkurhudbqvdzhjjynqyi.supabase.co/functions/v1/pitch-creator \
  -H "Content-Type: application/json" \
  -d '{"product": "test"}'

# ✅ Attendu: 401 Unauthorized
```

### ❌ TEST: Accès non-premium
```bash
# Créer utilisateur non-premium
# Tenter d'accéder /pitch

# ✅ Attendu:
# - Frontend: Redirection vers /premium via PremiumGuard
# - Backend: 402 Payment Required
```

### ✅ TEST: Signature webhook invalide
```bash
# Modifier stripe-webhook temporairement pour logger
# Envoyer webhook avec mauvaise signature

curl -X POST https://bkurhudbqvdzhjjynqyi.supabase.co/functions/v1/stripe-webhook \
  -H "stripe-signature: invalid" \
  -H "Content-Type: application/json" \
  -d '{}'

# ✅ Attendu: 400 Bad Request "No signature header" ou "Invalid signature"
```

---

## 📋 Checklist Finale Pré-Production

### Configuration Stripe
- [ ] Webhook production configuré avec bonne URL
- [ ] Événements activés: checkout.session.completed, customer.subscription.*, invoice.*
- [ ] Webhook secret (whsec_xxx) sauvegardé en secret Supabase
- [ ] STRIPE_SECRET_KEY en mode live (sk_live_xxx)
- [ ] STRIPE_PRICE_ID correspond au prix réel 19€/mois

### Configuration Resend
- [ ] Domaine vérifié (SPF + DKIM)
- [ ] RESEND_API_KEY configuré
- [ ] EMAIL_FROM avec domaine vérifié
- [ ] Test d'envoi email réussi

### Base de Données
- [ ] RLS activé sur subscriptions et payment_transactions
- [ ] Fonction has_active_subscription testée
- [ ] Trigger update_updated_at_column fonctionne

### Sécurité
- [ ] Webhooks signés vérifiés
- [ ] Edge functions premium protégées
- [ ] PremiumGuard actif sur pages sensibles
- [ ] Pas de secrets en clair dans le code

### Tests
- [ ] Checkout réussi → abonnement créé
- [ ] Trial 7j → accès immédiat
- [ ] Renouvellement → paiement récurrent OK
- [ ] Annulation → accès maintenu jusqu'à fin période
- [ ] Échec paiement → alerte email envoyée

### Monitoring
- [ ] Alertes configurées pour webhook failures
- [ ] Logs accessibles (Supabase Logs)
- [ ] Métriques MRR/Churn suivies

---

## 📞 En Cas de Problème

### Webhook ne reçoit pas d'événements
```bash
# Vérifier:
1. URL correcte dans Stripe Dashboard
2. Événements sélectionnés
3. Webhook secret correct (whsec_xxx)
4. HTTPS activé
5. Edge function déployée

# Tester manuellement:
stripe trigger checkout.session.completed
stripe logs tail
```

### Abonnement non créé après paiement
```bash
# 1. Vérifier logs webhook
SELECT * FROM payment_transactions ORDER BY created_at DESC LIMIT 10;

# 2. Vérifier email customer dans Stripe
# 3. Vérifier user existe dans auth.users avec même email
# 4. Tester webhook manuellement
```

### Emails non reçus
```bash
# 1. Vérifier domaine vérifié sur Resend
# 2. Vérifier spam folder
# 3. Tester envoi manuel:
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from": "noreply@maxmarketing.com", "to": "test@example.com", "subject": "Test", "html": "<p>Test</p>"}'
```

---

**✅ Tests complets et reproductibles pour valider l'architecture de paiement**
