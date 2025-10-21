import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import authRouter from './auth.js';
import paymentsRouter from './payments.js';
import historiesRouter from './histories.js';
import rgpdRouter from './rgpd.js';
import generateRouter from './generate.js';

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
// Stripe requires the raw body for webhook signature verification
app.use('/webhook/stripe', express.raw({ type: 'application/json' }));
app.use(json({ limit: '1mb' }));
app.use(urlencoded({ extended: true }));

app.get('/health', (_req, res) => res.json({ ok: true }));

// Raw body for Stripe webhook must be before json middleware for that route
// Payments routes
app.use(paymentsRouter);

app.use('/api/auth', authRouter);
app.use(historiesRouter);
// RGPD endpoints at root paths per spec
app.use(rgpdRouter);
app.use('/generate', generateRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
