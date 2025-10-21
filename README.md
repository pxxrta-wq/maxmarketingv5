## Max Marketing App

### Setup
1. Copy `.env.example` to `.env` and fill values.
2. Database: ensure Postgres is reachable via `DB_URL`. Apply DDL in `backend/src/db.sql` (enable `pgcrypto` extension).
3. Backend: `cd backend && npm install && npm run dev`.
4. Frontend: open `frontend/index.html` with a local server (e.g. Live Server) or any static host.

### Endpoints
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/request-password-reset`, `GET /api/auth/validate-reset?token=`, `POST /api/auth/reset-password`
- Payments: `POST /create-checkout-session` (JWT), `POST /webhook/stripe` (Stripe), `GET /subscription-status` (JWT)
- Histories: `GET /api/histories` (JWT Premium), `POST /api/histories` (JWT Premium)
- RGPD: `GET /export-user-data` (JWT), `POST /delete-user-data` (JWT)
- Generate (mock): `POST /generate/{avatar|pitch|plan|email}` (JWT Premium)

### Stripe CLI Playbook
- Login: `stripe login`
- Listen: `stripe listen --forward-to localhost:3000/webhook/stripe`
- Test checkout flow: Log in on frontend and click "Passer en Premium".

### QA
See `QA_CHECKLIST.md`.
