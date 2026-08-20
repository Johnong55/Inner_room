import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { emailHash, passwordHash, passwordMatches, tokenHash } from '../services/crypto.js';
import { createAccessToken } from '../services/tokens.js';

export const authRouter = Router();

async function session(user: { id: string; anonymous: boolean }) {
  const refreshToken = randomBytes(32).toString('base64url');
  await pool.query('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, now() + interval \'30 days\')', [user.id, tokenHash(refreshToken)]);
  return { accessToken: await createAccessToken(user.id, user.anonymous), refreshToken, expiresIn: 900, anonymous: user.anonymous };
}

authRouter.post('/anonymous', async (_req, res) => {
  const result = await pool.query<{ id: string; anonymous: boolean }>('INSERT INTO users (anonymous) VALUES (true) RETURNING id, anonymous');
  res.status(201).json(await session(result.rows[0]));
});

const credentialsSchema = z.object({ email: z.email().max(254), password: z.string().min(10).max(128) });

authRouter.post('/register', async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_CREDENTIALS' });
  try {
    const result = await pool.query<{ id: string; anonymous: boolean }>(
      'INSERT INTO users (email_hash, password_hash, anonymous) VALUES ($1, $2, false) RETURNING id, anonymous',
      [emailHash(parsed.data.email), await passwordHash(parsed.data.password)],
    );
    res.status(201).json(await session(result.rows[0]));
  } catch (error) {
    if ((error as { code?: string }).code === '23505') return res.status(409).json({ error: 'ACCOUNT_EXISTS' });
    throw error;
  }
});

authRouter.post('/login', async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_CREDENTIALS' });
  const result = await pool.query<{ id: string; anonymous: boolean; password_hash: string }>('SELECT id, anonymous, password_hash FROM users WHERE email_hash = $1 AND deleted_at IS NULL', [emailHash(parsed.data.email)]);
  const user = result.rows[0];
  if (!user || !(await passwordMatches(parsed.data.password, user.password_hash))) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
  res.json(await session(user));
});

authRouter.post('/refresh', async (req, res) => {
  const parsed = z.object({ refreshToken: z.string().min(32) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_REFRESH_TOKEN' });
  const result = await pool.query<{ id: string; user_id: string; anonymous: boolean }>(
    `SELECT rt.id, rt.user_id, u.anonymous FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id
     WHERE rt.token_hash = $1 AND rt.revoked_at IS NULL AND rt.expires_at > now() AND u.deleted_at IS NULL`,
    [tokenHash(parsed.data.refreshToken)],
  );
  const row = result.rows[0];
  if (!row) return res.status(401).json({ error: 'INVALID_REFRESH_TOKEN' });
  await pool.query('UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1', [row.id]);
  res.json(await session({ id: row.user_id, anonymous: row.anonymous }));
});
