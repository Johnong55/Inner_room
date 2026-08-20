import { createHash } from 'node:crypto';
import { Router } from 'express';
import { pool } from '../db/pool.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { decryptForUser } from '../services/crypto.js';

export const meRouter = Router();
meRouter.use(requireAuth);

meRouter.get('/export', async (req: AuthenticatedRequest, res) => {
  const userId = req.auth!.userId;
  const result = await pool.query<{ entity: string; entity_id: string; ciphertext: string; iv: string; auth_tag: string; client_updated_at: Date; deleted: boolean }>('SELECT entity, entity_id, ciphertext, iv, auth_tag, client_updated_at, deleted FROM user_entries WHERE user_id = $1 ORDER BY client_updated_at', [userId]);
  res.setHeader('Content-Disposition', 'attachment; filename="innerroom-cloud-export.json"');
  res.json({ version: 1, exportedAt: new Date().toISOString(), entries: result.rows.map((row) => ({ entity: row.entity, entityId: row.entity_id, payload: decryptForUser(userId, { ciphertext: row.ciphertext, iv: row.iv, authTag: row.auth_tag }), updatedAt: row.client_updated_at, deleted: row.deleted })) });
});

meRouter.delete('/data', async (req: AuthenticatedRequest, res) => {
  const userId = req.auth!.userId;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('INSERT INTO deletion_receipts (anonymous_user_hash) VALUES ($1)', [createHash('sha256').update(userId).digest('hex')]);
    await client.query('DELETE FROM users WHERE id = $1', [userId]);
    await client.query('COMMIT');
    res.status(204).end();
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
});
