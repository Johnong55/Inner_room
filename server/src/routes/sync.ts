import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { decryptForUser, encryptForUser } from '../services/crypto.js';

export const syncRouter = Router();
syncRouter.use(requireAuth);

const operationSchema = z.object({
  entity: z.enum(['journal', 'mood', 'letter', 'conversation', 'thought']),
  entityId: z.string().min(1).max(128),
  operation: z.enum(['upsert', 'delete']),
  payload: z.unknown(),
  clientUpdatedAt: z.iso.datetime(),
});

syncRouter.post('/push', async (req: AuthenticatedRequest, res) => {
  const parsed = z.object({ operations: z.array(operationSchema).max(100) }).safeParse(req.body);
  if (!parsed.success || !req.auth) return res.status(400).json({ error: 'INVALID_SYNC_BATCH' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const operation of parsed.data.operations) {
      const encrypted = encryptForUser(req.auth.userId, operation.payload);
      await client.query(
        `INSERT INTO user_entries (user_id, entity, entity_id, ciphertext, iv, auth_tag, client_updated_at, deleted)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (user_id, entity, entity_id) DO UPDATE SET
          ciphertext=excluded.ciphertext, iv=excluded.iv, auth_tag=excluded.auth_tag,
          client_updated_at=excluded.client_updated_at, server_updated_at=now(), deleted=excluded.deleted
         WHERE user_entries.client_updated_at <= excluded.client_updated_at`,
        [req.auth.userId, operation.entity, operation.entityId, encrypted.ciphertext, encrypted.iv, encrypted.authTag, operation.clientUpdatedAt, operation.operation === 'delete'],
      );
    }
    await client.query('COMMIT');
    res.json({ accepted: parsed.data.operations.length, serverTime: new Date().toISOString() });
  } catch (error) {
    await client.query('ROLLBACK'); throw error;
  } finally { client.release(); }
});

syncRouter.get('/pull', async (req: AuthenticatedRequest, res) => {
  if (!req.auth) return res.status(401).json({ error: 'AUTH_REQUIRED' });
  const sinceResult = z.iso.datetime().safeParse(req.query.since ?? new Date(0).toISOString());
  if (!sinceResult.success) return res.status(400).json({ error: 'INVALID_CURSOR' });
  const result = await pool.query<{ entity: string; entity_id: string; ciphertext: string; iv: string; auth_tag: string; client_updated_at: Date; server_updated_at: Date; deleted: boolean }>(
    'SELECT entity, entity_id, ciphertext, iv, auth_tag, client_updated_at, server_updated_at, deleted FROM user_entries WHERE user_id = $1 AND server_updated_at > $2 ORDER BY server_updated_at LIMIT 500',
    [req.auth.userId, sinceResult.data],
  );
  res.json({
    changes: result.rows.map((row) => ({ entity: row.entity, entityId: row.entity_id, payload: decryptForUser(req.auth!.userId, { ciphertext: row.ciphertext, iv: row.iv, authTag: row.auth_tag }), clientUpdatedAt: row.client_updated_at, serverUpdatedAt: row.server_updated_at, deleted: row.deleted })),
    cursor: result.rows.at(-1)?.server_updated_at.toISOString() ?? sinceResult.data,
  });
});
