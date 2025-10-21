import express from 'express';
import { requireAuth, requirePremium } from './middleware.js';

const router = express.Router();

function respond(text) { return { text, meta: { model: 'mock', tokens: text.length } }; }

router.post('/avatar', requireAuth, requirePremium, (req, res) => {
  res.json(respond('Avatar de marque généré.'));
});

router.post('/pitch', requireAuth, requirePremium, (req, res) => {
  res.json(respond('Pitch marketing synthétique.'));
});

router.post('/plan', requireAuth, requirePremium, (req, res) => {
  res.json(respond('Plan marketing hebdomadaire (court).'));
});

router.post('/email', requireAuth, requirePremium, (req, res) => {
  res.json(respond('Email promotionnel rédigé.'));
});

export default router;
