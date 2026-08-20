import { create } from 'zustand';

import {
  defaultPreferences,
  type PrivatePreferences,
  readPreferences,
  writePreferences,
} from '@/services/storage/securePreferences';

type PreferencesState = PrivatePreferences & {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  update: (patch: Partial<PrivatePreferences>) => Promise<void>;
};

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  ...defaultPreferences,
  hydrated: false,
  hydrate: async () => set({ ...(await readPreferences()), hydrated: true }),
  update: async (patch) => {
    const next = { ...defaultPreferences, ...get(), ...patch } as PrivatePreferences;
    set(patch);
    await writePreferences(next);
  },
}));
