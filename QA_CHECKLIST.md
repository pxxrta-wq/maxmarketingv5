### QA Checklist - Max Marketing

- **Paiement (Stripe)**
  - Démarrer backend sur http://localhost:3000 et front (fichier `frontend/index.html` ou serveur local)
  - Se connecter avec un compte test
  - Cliquer "Passer en Premium" → redirige vers Stripe Checkout
  - Réaliser un paiement de test
  - Vérifier le webhook:
    - Lancer `stripe listen --forward-to localhost:3000/webhook/stripe`
    - Après checkout, l'événement `checkout.session.completed` est reçu
    - L'utilisateur devient `is_premium=true` et reçoit l'email de bienvenue
  - Appeler `GET /subscription-status` (avec JWT) → `is_premium: true`

- **Thèmes**
  - Changer le thème via le sélecteur dans la sidebar
  - Vérifier que sidebar, bulles et boutons changent et gardent un contraste suffisant (WCAG AA)
  - Essayer un thème Premium sans abonnement → bloqué côté client

- **Persistance**
  - Écrire du contenu dans `Emails`, `Stratégies`, `Plan` → changer de module et revenir
  - Le contenu se restaure depuis `localStorage`
  - Avec compte Premium, basculer de module → un POST `/api/histories` est envoyé

- **Auth**
  - `POST /api/auth/register` crée un user (email unique)
  - `POST /api/auth/login` renvoie `{ token, id, email, is_premium }`
  - `POST /api/auth/request-password-reset` envoie un email (console en dev)
  - `GET /api/auth/validate-reset?token=...` → `{ ok: true }`
  - `POST /api/auth/reset-password` fonctionne avec le token

- **Performance**
  - Envoyer un message dans le chat → la réponse simulée s'affiche rapidement
  - Régler la vitesse du typewriter (Normal / Rapide / Lent)

- **RGPD**
  - `GET /export-user-data` (JWT) → JSON complet
  - `GET /export-user-data?format=zip` → téléchargement d'un ZIP
  - `POST /delete-user-data` anonymise l'utilisateur et supprime les historiques
