# ⚙️ Configuration Finale - Max Marketing Premium

## 📋 URL À CONFIGURER DANS STRIPE

### 1️⃣ Webhook URL Production
```
URL: https://bkurhudbqvdzhjjynqyi.supabase.co/functions/v1/stripe-webhook
```

### 2️⃣ Événements à activer dans Stripe Dashboard
```
✅ checkout.session.completed
✅ customer.subscription.created
✅ customer.subscription.updated
✅ customer.subscription.deleted
✅ invoice.payment_succeeded
✅ invoice.payment_failed
```

### 3️⃣ Récupération du Webhook Secret
1. Aller dans **Stripe Dashboard** → Developers → Webhooks
2. Cliquer sur le webhook créé
3. Copier le **Signing secret** (commence par `whsec_`)
4. L'ajouter dans les secrets Lovable Cloud sous le nom `STRIPE_WEBHOOK_SECRET`

---

## 🔐 Secrets Lovable Cloud Requis

| Secret Name | Type | Exemple | Où l'obtenir |
|------------|------|---------|--------------|
| `STRIPE_SECRET_KEY` | ✅ Configuré | `sk_live_xxx` | Stripe Dashboard → API Keys |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ À ajouter | `whsec_xxx` | Stripe Dashboard → Webhooks |
| `RESEND_API_KEY` | ✅ Configuré | `re_xxx` | resend.com/api-keys |
| `STRIPE_PRICE_ID` | ⚠️ À vérifier | `price_xxx` | Stripe Dashboard → Products |

### Comment ajouter un secret
```bash
# Via Lovable Cloud UI:
1. Ouvrir le projet
2. Backend → Secrets
3. Add Secret
4. Nom: STRIPE_WEBHOOK_SECRET
5. Valeur: whsec_xxxxxxxx (copié depuis Stripe)
```

---

## 📧 Configuration Resend (Emails)

### 1️⃣ Vérifier votre domaine
```
1. Aller sur https://resend.com/domains
2. Ajouter maxmarketing.com (ou votre domaine)
3. Ajouter les DNS records fournis:
   - TXT record pour vérification
   - MX records pour SPF
   - CNAME pour DKIM
4. Attendre validation (5-30 min)
```

### 2️⃣ Variable EMAIL_FROM
```bash
# Après validation du domaine, créer secret:
EMAIL_FROM=noreply@maxmarketing.com
```

### 3️⃣ Tester l'envoi
```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@maxmarketing.com",
    "to": "votre-email@example.com",
    "subject": "Test Max Marketing",
    "html": "<p>Email de test ✅</p>"
  }'
```

---

## 🎯 Configuration Auth (Développement UNIQUEMENT)

### Auto-confirm emails (DEV)
```bash
# Pour tester sans validation d'email:
1. Lovable Cloud → Backend → Auth Settings
2. Enable "Auto Confirm Email"
3. ⚠️ DÉSACTIVER EN PRODUCTION!
```

### Redirect URLs
```bash
# Ajouter ces URLs dans Auth Settings:
1. https://votre-app.lovable.app/
2. https://votre-domaine-custom.com/ (si applicable)
3. http://localhost:5173/ (dev local)
```

---

## 🧪 Validation Post-Déploiement

### ✅ Checklist de tests manuels

#### 1. Authentification
```bash
✅ Créer compte → Email confirmé
✅ Login → Redirection dashboard
✅ "Se souvenir de moi" → Email pré-rempli
✅ Logout → Session cleared
```

#### 2. Checkout Stripe
```bash
✅ /premium → Cliquer "Passer en Premium"
✅ Redirection Stripe Checkout
✅ Carte test 4242 4242 4242 4242
✅ Redirection /payment-success
✅ Confetti animation
✅ Email de bienvenue reçu
```

#### 3. Accès Premium
```bash
✅ /pitch → Accessible (avant: bloqué)
✅ /avatar → Accessible (avant: bloqué)
✅ /plan → Accessible (avant: bloqué)
✅ /email → Accessible (auth only)
✅ /social → Accessible (auth only)
```

#### 4. Base de données
```sql
-- Vérifier abonnement créé
SELECT * FROM subscriptions WHERE user_id = 'xxx';

-- Vérifier transaction enregistrée
SELECT * FROM payment_transactions WHERE user_id = 'xxx';

-- Résultat attendu:
-- subscriptions.status = 'trialing'
-- subscriptions.current_period_end = now() + 7 days
-- payment_transactions.status = 'completed'
```

#### 5. Webhooks
```bash
✅ Logs Stripe → Événement 200 OK
✅ Logs Supabase → Fonction exécutée
✅ Pas d'erreurs dans les logs
```

---

## 🚨 Alertes & Monitoring

### Métriques critiques à surveiller

#### Webhooks
```bash
# Taux d'échec acceptable: < 1%
Alerte si: webhook_failure_rate > 5%
Action: Vérifier logs Supabase + Stripe
```

#### Paiements
```bash
# Taux de réussite attendu: > 95%
Alerte si: payment_failure_rate > 10%
Action: Vérifier cartes expirées + contacter utilisateurs
```

#### MRR (Monthly Recurring Revenue)
```sql
-- Calculer quotidiennement
SELECT SUM(price_amount) / 100.0 AS mrr_eur
FROM subscriptions
WHERE status IN ('active', 'trialing');

-- Alerte si: MRR baisse de > 15% en 7 jours
```

#### Conversion Trial → Paid
```sql
-- Objectif: > 30%
SELECT 
  COUNT(CASE WHEN status = 'active' AND current_period_start > NOW() - INTERVAL '30 days' THEN 1 END) * 100.0 /
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '37 days' THEN 1 END) AS conversion_rate
FROM subscriptions;
```

---

## 📞 Support & Dépannage

### Problème: Webhook ne fonctionne pas
```bash
# Diagnostics:
1. Vérifier URL: https://bkurhudbqvdzhjjynqyi.supabase.co/functions/v1/stripe-webhook
2. Vérifier STRIPE_WEBHOOK_SECRET dans secrets
3. Tester manuellement:
   stripe trigger checkout.session.completed
4. Vérifier logs:
   stripe logs tail --filter-events checkout.*
5. Vérifier Supabase logs (Backend → Functions → stripe-webhook)
```

### Problème: Email non reçu
```bash
# Diagnostics:
1. Vérifier spam folder
2. Vérifier domaine vérifié sur Resend
3. Vérifier RESEND_API_KEY correct
4. Tester envoi manuel (curl ci-dessus)
5. Vérifier logs Supabase (rechercher "RESEND" ou "email")
```

### Problème: Accès premium bloqué après paiement
```bash
# Diagnostics:
1. Vérifier abonnement en DB:
   SELECT * FROM subscriptions WHERE user_id = 'xxx';
2. Vérifier status = 'active' ou 'trialing'
3. Vérifier current_period_end > NOW()
4. Tester check-subscription:
   curl -X POST https://bkurhudbqvdzhjjynqyi.supabase.co/functions/v1/check-subscription \
     -H "Authorization: Bearer USER_JWT_TOKEN"
5. Forcer refresh côté client (F5 ou logout/login)
```

---

## 🎉 PRÊT POUR LA PRODUCTION

### Dernières vérifications
```bash
✅ Webhooks configurés et testés
✅ Emails fonctionnels (domaine vérifié)
✅ Cartes de test validées
✅ RLS policies actives
✅ Secrets en mode production (sk_live_xxx, pas sk_test_xxx)
✅ Auto-confirm désactivé en production
✅ HTTPS activé partout
✅ Monitoring configuré
```

### Go-Live Command
```bash
# 1. Basculer Stripe en mode Live
STRIPE_SECRET_KEY=sk_live_xxx (pas sk_test_xxx)
STRIPE_PRICE_ID=price_live_xxx (créer prix en mode Live)

# 2. Re-configurer webhook en mode Live
URL: https://bkurhudbqvdzhjjynqyi.supabase.co/functions/v1/stripe-webhook
Récupérer nouveau whsec_xxx et remplacer STRIPE_WEBHOOK_SECRET

# 3. Désactiver auto-confirm emails
Backend → Auth Settings → Désactiver "Auto Confirm"

# 4. Annoncer lancement 🚀
```

---

## 📊 Dashboard Recommandé (À créer ultérieurement)

### KPIs à afficher
```typescript
// Métriques temps réel
- MRR (Monthly Recurring Revenue)
- Nombre d'abonnés actifs
- Taux de conversion trial → paid
- Churn rate mensuel
- Revenu total (lifetime)
- Graphique évolution MRR
- Top 5 utilisateurs (par LTV)
- Alertes (paiements échoués, webhooks down)
```

### SQL Queries utiles
```sql
-- MRR
SELECT SUM(price_amount)/100.0 FROM subscriptions WHERE status IN ('active','trialing');

-- Churn rate (30 derniers jours)
SELECT COUNT(*) * 100.0 / 
  (SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND created_at < NOW() - INTERVAL '30 days')
FROM subscriptions 
WHERE status = 'canceled' AND canceled_at > NOW() - INTERVAL '30 days';

-- LTV moyen (par utilisateur)
SELECT AVG(total_paid) FROM (
  SELECT user_id, SUM(amount)/100.0 AS total_paid 
  FROM payment_transactions 
  WHERE status = 'completed' 
  GROUP BY user_id
) AS user_totals;
```

---

**🚀 Architecture complète déployée et testable !**

Pour toute question ou bug, vérifier:
1. `ARCHITECTURE_PAIEMENT.md` (vue d'ensemble)
2. `TESTS_STRIPE.md` (scénarios de test)
3. `CONFIGURATION_FINALE.md` (ce fichier, configuration détaillée)
