import * as Crypto from 'expo-crypto';

export async function createPinHash(pin: string) {
  const salt = Crypto.randomUUID();
  const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);
  return `${salt}:${digest}`;
}

export async function verifyPin(pin: string, stored: string) {
  const [salt, expected] = stored.split(':');
  if (!salt || !expected) return false;
  const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);
  return digest === expected;
}
