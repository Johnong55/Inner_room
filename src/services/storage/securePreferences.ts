import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const key = 'innerroom.preferences.v1';

export type PrivatePreferences = {
  hasOnboarded: boolean;
  memoryEnabled: boolean;
  aiHistoryEnabled: boolean;
  cloudSyncEnabled: boolean;
  anonymousMode: boolean;
  biometricEnabled: boolean;
  pinHash: string | null;
  notificationEnabled: boolean;
};

export const defaultPreferences: PrivatePreferences = {
  hasOnboarded: false,
  memoryEnabled: false,
  aiHistoryEnabled: false,
  cloudSyncEnabled: false,
  anonymousMode: true,
  biometricEnabled: false,
  pinHash: null,
  notificationEnabled: false,
};

export async function readPreferences(): Promise<PrivatePreferences> {
  try {
    const raw = Platform.OS === 'web' ? globalThis.localStorage?.getItem(key) : await SecureStore.getItemAsync(key);
    return raw ? { ...defaultPreferences, ...JSON.parse(raw) } : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
}

export async function writePreferences(value: PrivatePreferences) {
  const raw = JSON.stringify(value);
  if (Platform.OS === 'web') globalThis.localStorage?.setItem(key, raw);
  else await SecureStore.setItemAsync(key, raw, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
}

export async function clearPreferences() {
  if (Platform.OS === 'web') globalThis.localStorage?.removeItem(key);
  else await SecureStore.deleteItemAsync(key);
}
