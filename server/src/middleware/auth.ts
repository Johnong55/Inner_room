import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../services/tokens.js';

export type AuthenticatedRequest = Request & { auth?: { userId: string; anonymous: boolean } };

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const value = req.headers.authorization;
    if (!value?.startsWith('Bearer ')) return res.status(401).json({ error: 'AUTH_REQUIRED' });
    req.auth = await verifyAccessToken(value.slice(7));
    next();
  } catch {
    res.status(401).json({ error: 'INVALID_TOKEN' });
  }
}
