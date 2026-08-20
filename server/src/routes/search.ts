import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { semanticSearch } from '../services/search.js';

export const searchRouter = Router();
searchRouter.use(rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false }));
searchRouter.post('/', async (req, res) => {
  const parsed = z.object({ query: z.string().min(2).max(500), entries: z.array(z.object({ id: z.string().max(128), createdAt: z.iso.datetime(), body: z.string().min(1).max(3000) })).max(100) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_SEARCH_REQUEST' });
  res.json({ matches: await semanticSearch(parsed.data.query, parsed.data.entries) });
});
