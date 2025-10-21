import express from 'express';
import archiver from 'archiver';
import { requireAuth } from './middleware.js';
import { query } from './db.js';

const router = express.Router();

router.get('/export-user-data', requireAuth, async (req, res) => {
  const userId = req.user.sub;
  const [{ rows: users }, { rows: histories }, { rows: subs }] = await Promise.all([
    query('SELECT id, email, username, is_premium, premium_since, created_at FROM users WHERE id = $1', [userId]),
    query('SELECT id, module, content_json, created_at, updated_at FROM histories WHERE user_id = $1', [userId]),
    query('SELECT id, provider, provider_subscription_id, status, current_period_end, created_at FROM subscriptions WHERE user_id = $1', [userId])
  ]);
  const json = { user: users[0], histories, subscriptions: subs };
  const format = (req.query.format || 'json').toString();
  if (format === 'zip') {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="user-data.zip"');
    const archive = archiver('zip');
    archive.pipe(res);
    archive.append(JSON.stringify(json, null, 2), { name: 'user-data.json' });
    await archive.finalize();
  } else {
    res.json(json);
  }
});

router.post('/delete-user-data', requireAuth, async (req, res) => {
  const userId = req.user.sub;
  await query('DELETE FROM histories WHERE user_id = $1', [userId]);
  await query(
    "UPDATE users SET email = concat(id::text, '@example.invalid'), username = NULL, password_hash = 'x', stripe_customer_id = NULL, paypal_customer_id = NULL, is_premium = false WHERE id = $1",
    [userId]
  );
  res.json({ ok: true });
});

export default router;
