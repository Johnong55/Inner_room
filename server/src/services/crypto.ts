import { createCipheriv, createDecipheriv, createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { config } from '../config.js';

const scrypt = promisify(scryptCallback);

function userKey(userId: string) {
  return createHmac('sha256', config.ENCRYPTION_MASTER_KEY).update(`innerroom:user:${userId}`).digest();
}

export function encryptForUser(userId: string, value: unknown) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', userKey(userId), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return { ciphertext: ciphertext.toString('base64'), iv: iv.toString('base64'), authTag: cipher.getAuthTag().toString('base64') };
}

export function decryptForUser(userId: string, encrypted: { ciphertext: string; iv: string; authTag: string }) {
  const decipher = createDecipheriv('aes-256-gcm', userKey(userId), Buffer.from(encrypted.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(encrypted.authTag, 'base64'));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(encrypted.ciphertext, 'base64')), decipher.final()]).toString('utf8')) as unknown;
}

export const emailHash = (email: string) => createHmac('sha256', config.JWT_SECRET).update(email.trim().toLocaleLowerCase()).digest('hex');
export const tokenHash = (token: string) => createHmac('sha256', config.JWT_SECRET).update(token).digest('hex');

export async function passwordHash(password: string) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `${salt.toString('base64')}:${derived.toString('base64')}`;
}

export async function passwordMatches(password: string, stored: string) {
  const [salt, expected] = stored.split(':');
  if (!salt || !expected) return false;
  const derived = await scrypt(password, Buffer.from(salt, 'base64'), 64) as Buffer;
  const expectedBuffer = Buffer.from(expected, 'base64');
  return derived.length === expectedBuffer.length && timingSafeEqual(derived, expectedBuffer);
}
