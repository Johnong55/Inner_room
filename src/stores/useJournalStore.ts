import { create } from 'zustand';

import { listJournals, removeJournal, upsertJournal } from '@/database';
import type { JournalEntry } from '@/types';

type JournalState = {
  entries: JournalEntry[];
  loading: boolean;
  load: () => Promise<void>;
  save: (entry: JournalEntry) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export const useJournalStore = create<JournalState>((set) => ({
  entries: [],
  loading: false,
  load: async () => {
    set({ loading: true });
    set({ entries: await listJournals(), loading: false });
  },
  save: async (entry) => {
    await upsertJournal(entry);
    set((state) => ({ entries: [entry, ...state.entries.filter((item) => item.id !== entry.id)] }));
  },
  remove: async (entryId) => {
    await removeJournal(entryId);
    set((state) => ({ entries: state.entries.filter((entry) => entry.id !== entryId) }));
  },
}));
