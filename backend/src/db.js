import dotenv from 'dotenv';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DB_URL });

export async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export function newId() {
  return randomUUID();
}

export async function getUserByEmail(email) {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

export async function getUserById(id) {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function upsertSubscription({ userId, provider, providerSubscriptionId, status, currentPeriodEnd }) {
  await query(
    `INSERT INTO subscriptions (id, user_id, provider, provider_subscription_id, status, current_period_end)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (provider_subscription_id)
     DO UPDATE SET status = EXCLUDED.status, current_period_end = EXCLUDED.current_period_end`,
    [newId(), userId, provider, providerSubscriptionId, status, currentPeriodEnd]
  );
}

export async function logWebhook({ provider, eventId, payload, status }) {
  await query(
    `INSERT INTO webhook_logs (id, provider, event_id, payload, processed_at, status)
     VALUES ($1, $2, $3, $4, now(), $5)
     ON CONFLICT (event_id) DO NOTHING`,
    [newId(), provider, eventId, payload, status]
  );
}
