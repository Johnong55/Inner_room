import { createHash } from 'node:crypto';
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { reflect } from '../services/reflection.js';

export const reflectionRouter = Router();

reflectionRouter.use(rateLimit({ windowMs: 60_000, limit: 12, standardHeaders: 'draft-8', legacyHeaders: false }));

const schema = z.object({
  mode: z.enum(['mirror', 'tomorrow', 'untangle', 'listen']),
  intent: z.enum(['listen', 'understand', 'untangle', 'perspective', 'next-step']),
  messages: z.array(z.object({ role: z.enum(['user', 'reflection']), content: z.string().min(1).max(8_000) })).min(1).max(12),
  journalContext: z.array(z.object({ id: z.string().max(128), createdAt: z.iso.datetime(), body: z.string().max(1_800) })).max(5).default([]),
  anonymousMode: z.boolean().default(true),
});

reflectionRouter.post('/', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_REFLECTION_REQUEST' });
  const networkHint = `${req.ip ?? 'unknown'}:${req.get('user-agent') ?? 'unknown'}`;
  const safetyIdentifier = createHash('sha256').update(networkHint).digest('hex').slice(0, 32);
  res.json(await reflect({ ...parsed.data, safetyIdentifier }));
});
