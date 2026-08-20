import { SignJWT, jwtVerify } from 'jose';
import { config } from '../config.js';

const secret = new TextEncoder().encode(config.JWT_SECRET);

export async function createAccessToken(userId: string, anonymous: boolean) {
  return new SignJWT({ anonymous }).setProtectedHeader({ alg: 'HS256' }).setSubject(userId).setIssuer('innerroom-api').setAudience('innerroom-mobile').setIssuedAt().setExpirationTime('15m').sign(secret);
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, secret, { issuer: 'innerroom-api', audience: 'innerroom-mobile' });
  if (!payload.sub) throw new Error('TOKEN_SUBJECT_MISSING');
  return { userId: payload.sub, anonymous: payload.anonymous === true };
}
