import { listJournals, searchJournals } from '@/database';
import type { JournalEntry } from '@/types';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export async function searchOwnLife(query: string, allowSemantic: boolean): Promise<{ entries: JournalEntry[]; semantic: boolean }> {
  const entries = await listJournals();
  if (!allowSemantic || !apiUrl || entries.length < 2) return { entries: await searchJournals(query), semantic: false };
  try {
    const response = await fetch(`${apiUrl}/v1/search`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, entries: entries.slice(0, 100).map(({ id, createdAt, body }) => ({ id, createdAt, body: body.slice(0, 3000) })) }),
    });
    if (!response.ok) throw new Error('SEMANTIC_SEARCH_UNAVAILABLE');
    const result = await response.json() as { matches: { id: string; score: number }[] };
    return { entries: result.matches.map((match) => entries.find((entry) => entry.id === match.id)).filter((entry): entry is JournalEntry => Boolean(entry)), semantic: true };
  } catch {
    return { entries: await searchJournals(query), semantic: false };
  }
}
