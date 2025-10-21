import express from 'express';
import { z } from 'zod';
import { query } from './db.js';
import { requireAuth, requirePremium } from './middleware.js';

const router = express.Router();

const CreateSchema = z.object({ module: z.enum(['avatar','pitch','plan','email']), content: z.any() });

router.post('/api/histories', requireAuth, requirePremium, async (req, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });
  const { module, content } = parsed.data;
  const { rows } = await query('INSERT INTO histories (id, user_id, module, content_json, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3::jsonb, now(), now()) RETURNING *', [req.user.sub, module, JSON.stringify(content)]);
  res.json(rows[0]);
});

router.get('/api/histories', requireAuth, requirePremium, async (req, res) => {
  const { rows } = await query('SELECT * FROM histories WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100', [req.user.sub]);
  res.json(rows);
});

export default router;
