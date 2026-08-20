import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { listPendingSyncOperations, markSyncOperationsComplete } from '@/database';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;
const sessionKey = 'innerroom.cloud-session.v1';
type Session = { accessToken: string; refreshToken: string; expiresIn: number; anonymous: boolean };

async function readSession(): Promise<Session | null> {
  const raw = Platform.OS === 'web' ? globalThis.localStorage?.getItem(sessionKey) : await SecureStore.getItemAsync(sessionKey);
  return raw ? JSON.parse(raw) as Session : null;
}

async function writeSession(session: Session | null) {
  if (Platform.OS === 'web') {
    if (session) globalThis.localStorage?.setItem(sessionKey, JSON.stringify(session)); else globalThis.localStorage?.removeItem(sessionKey);
  } else if (session) await SecureStore.setItemAsync(sessionKey, JSON.stringify(session), { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
  else await SecureStore.deleteItemAsync(sessionKey);
}

async function createAnonymousSession() {
  if (!apiUrl) throw new Error('CLOUD_NOT_CONFIGURED');
  const response = await fetch(`${apiUrl}/v1/auth/anonymous`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
  if (!response.ok) throw new Error('CLOUD_AUTH_FAILED');
  const session = await response.json() as Session;
  await writeSession(session);
  return session;
}

async function authenticated(path: string, init: RequestInit = {}) {
  const session = await readSession() ?? await createAnonymousSession();
  let response = await fetch(`${apiUrl}${path}`, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}`, ...init.headers } });
  if (response.status === 401) {
    const refreshed = await fetch(`${apiUrl}/v1/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: session.refreshToken }) });
    if (!refreshed.ok) { await writeSession(null); throw new Error('CLOUD_SESSION_EXPIRED'); }
    const next = await refreshed.json() as Session; await writeSession(next);
    response = await fetch(`${apiUrl}${path}`, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${next.accessToken}`, ...init.headers } });
  }
  return response;
}

export async function enableAnonymousSync() {
  await (readSession() ?? createAnonymousSession());
  return pushPendingChanges();
}

export async function pushPendingChanges() {
  const operations = await listPendingSyncOperations();
  if (!operations.length) return;
  const response = await authenticated('/v1/sync/push', {
    method: 'POST',
    body: JSON.stringify({ operations: operations.map((item) => ({ entity: item.entity, entityId: item.entityId, operation: item.operation, payload: JSON.parse(item.payload), clientUpdatedAt: item.createdAt })) }),
  });
  if (!response.ok) throw new Error('SYNC_PUSH_FAILED');
  await markSyncOperationsComplete(operations.map((item) => item.id));
}

export async function deleteCloudData() {
  if (!await readSession()) return;
  const response = await authenticated('/v1/me/data', { method: 'DELETE' });
  if (!response.ok && response.status !== 404) throw new Error('CLOUD_DELETE_FAILED');
  await writeSession(null);
}
