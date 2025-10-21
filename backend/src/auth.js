import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { z } from 'zod';
import { getUserByEmail, getUserById, newId, query } from './db.js';
import { sendEmail } from './email.js';

dotenv.config();

const router = express.Router();

const RegisterSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
const RequestResetSchema = z.object({ email: z.string().email() });
const ResetSchema = z.object({ token: z.string().min(10), password: z.string().min(8) });

function sign(user) {
  return jwt.sign({ sub: user.id, email: user.email, is_premium: user.is_premium }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });
  const { email, password } = parsed.data;
  const exists = await getUserByEmail(email);
  if (exists) return res.status(409).json({ error: 'Email exists' });
  const hash = await bcrypt.hash(password, 10);
  const id = newId();
  await query(
    'INSERT INTO users (id, email, password_hash, created_at) VALUES ($1, $2, $3, now())',
    [id, email, hash]
  );
  const user = await getUserById(id);
  const token = sign(user);
  res.json({ ...publicUser(user), token });
});

router.post('/login', async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });
  const { email, password } = parsed.data;
  const user = await getUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = sign(user);
  res.json({ ...publicUser(user), token });
});

router.post('/request-password-reset', async (req, res) => {
  const parsed = RequestResetSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });
  const { email } = parsed.data;
  const user = await getUserByEmail(email);
  if (user) {
    const token = await createResetToken(user.id);
    await sendResetEmail(email, token);
  }
  res.json({ ok: true });
});

router.get('/validate-reset', async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).json({ error: 'Missing token' });
  const row = await getResetToken(token);
  if (!row) return res.status(400).json({ error: 'Invalid token' });
  res.json({ ok: true, userId: row.user_id });
});

router.post('/reset-password', async (req, res) => {
  const parsed = ResetSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });
  const { token, password } = parsed.data;
  const row = await getResetToken(token);
  if (!row) return res.status(400).json({ error: 'Invalid token' });
  if (new Date(row.expires_at) < new Date()) return res.status(400).json({ error: 'Token expired' });
  const hash = await bcrypt.hash(password, 10);
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, row.user_id]);
  await query('DELETE FROM password_resets WHERE token = $1', [token]);
  res.json({ ok: true });
});

function publicUser(u) {
  return { id: u.id, email: u.email, username: u.username, is_premium: u.is_premium, premium_since: u.premium_since };
}

async function createResetToken(userId) {
  const token = cryptoRandom(40);
  const expires = new Date(Date.now() + 1000 * 60 * 30);
  await query(
    'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expires]
  );
  return token;
}

async function getResetToken(token) {
  const { rows } = await query('SELECT * FROM password_resets WHERE token = $1', [token]);
  return rows[0];
}

function cryptoRandom(len) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

async function sendResetEmail(email, token) {
  const domain = process.env.DOMAIN;
  const link = `${domain}/reset.html?token=${encodeURIComponent(token)}`;
  await sendEmail({ to: email, subject: 'Réinitialisation du mot de passe', text: `Réinitialisez votre mot de passe: ${link}` });
}

export default router;
