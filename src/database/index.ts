import { Platform } from "react-native";
import type { SQLiteDatabase } from "expo-sqlite";

import type {
  ChatMessage,
  ConversationModeId,
  JournalEntry,
  Letter,
  MoodId,
  TrustedContact,
} from "@/types";

let databasePromise: Promise<SQLiteDatabase> | null = null;
let webEntries: JournalEntry[] = [];
let webMoods: { moodId: MoodId; createdAt: string }[] = [];

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function db() {
  if (!databasePromise) {
    databasePromise = import("expo-sqlite").then((SQLite) =>
      SQLite.openDatabaseAsync("innerroom.db"),
    );
  }
  return databasePromise;
}

export async function initializeDatabase() {
  if (Platform.OS === "web") return;
  const database = await db();
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      mood_id TEXT,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS mood_checkins (
      id TEXT PRIMARY KEY NOT NULL,
      mood_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY NOT NULL,
      mode TEXT NOT NULL,
      title TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY NOT NULL,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS letters (
      id TEXT PRIMARY KEY NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      deliver_at TEXT NOT NULL,
      opened_at TEXT
    );
    CREATE TABLE IF NOT EXISTS trusted_contacts (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      relationship TEXT,
      phone TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS thought_records (
      id TEXT PRIMARY KEY NOT NULL,
      thought TEXT NOT NULL,
      facts TEXT NOT NULL DEFAULT '',
      assumptions TEXT NOT NULL DEFAULT '',
      action TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_journal_updated ON journal_entries(updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_moods_created ON mood_checkins(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_thoughts_created ON thought_records(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_letters_created ON letters(created_at DESC);
  `);
}

type JournalRow = {
  id: string;
  body: string;
  mood_id: MoodId | null;
  is_favorite: number;
  created_at: string;
  updated_at: string;
};
const fromRow = (row: JournalRow): JournalEntry => ({
  id: row.id,
  body: row.body,
  moodId: row.mood_id,
  isFavorite: row.is_favorite === 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function saveMoodCheckIn(moodId: MoodId) {
  const createdAt = new Date().toISOString();
  if (Platform.OS === "web") {
    webMoods.push({ moodId, createdAt });
    return;
  }
  await (
    await db()
  ).runAsync(
    "INSERT INTO mood_checkins (id, mood_id, created_at) VALUES (?, ?, ?)",
    id("mood"),
    moodId,
    createdAt,
  );
}

export async function upsertJournal(entry: JournalEntry) {
  if (Platform.OS === "web") {
    webEntries = [entry, ...webEntries.filter((item) => item.id !== entry.id)];
    return;
  }
  const database = await db();
  await database.runAsync(
    `INSERT INTO journal_entries (id, body, mood_id, is_favorite, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET body=excluded.body, mood_id=excluded.mood_id,
       is_favorite=excluded.is_favorite, updated_at=excluded.updated_at`,
    entry.id,
    entry.body,
    entry.moodId,
    entry.isFavorite ? 1 : 0,
    entry.createdAt,
    entry.updatedAt,
  );
  await queueSync("journal", entry.id, "upsert", entry);
}

export async function listJournals(): Promise<JournalEntry[]> {
  if (Platform.OS === "web")
    return [...webEntries].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
  const rows = await (
    await db()
  ).getAllAsync<JournalRow>(
    "SELECT * FROM journal_entries WHERE body != ? ORDER BY updated_at DESC",
    "",
  );
  return rows.map(fromRow);
}

export async function getJournal(
  entryId: string,
): Promise<JournalEntry | null> {
  if (Platform.OS === "web")
    return webEntries.find((item) => item.id === entryId) ?? null;
  const row = await (
    await db()
  ).getFirstAsync<JournalRow>(
    "SELECT * FROM journal_entries WHERE id = ?",
    entryId,
  );
  return row ? fromRow(row) : null;
}

export async function removeJournal(entryId: string) {
  if (Platform.OS === "web") {
    webEntries = webEntries.filter((item) => item.id !== entryId);
    return;
  }
  await (
    await db()
  ).runAsync("DELETE FROM journal_entries WHERE id = ?", entryId);
  await queueSync("journal", entryId, "delete", { id: entryId });
}

export async function searchJournals(query: string): Promise<JournalEntry[]> {
  const terms = query
    .toLocaleLowerCase("vi")
    .split(/\s+/)
    .filter((term) => term.length > 2);
  const all = await listJournals();
  return all
    .map((entry) => ({
      entry,
      score: terms.reduce(
        (sum, term) =>
          sum + (entry.body.toLocaleLowerCase("vi").includes(term) ? 1 : 0),
        0,
      ),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.entry);
}

export async function listMoodCheckIns() {
  if (Platform.OS === "web") return webMoods;
  return (await db()).getAllAsync<{ moodId: MoodId; createdAt: string }>(
    "SELECT mood_id as moodId, created_at as createdAt FROM mood_checkins ORDER BY created_at DESC",
  );
}

export async function createConversation(mode: ConversationModeId) {
  const conversationId = id("conversation");
  if (Platform.OS !== "web") {
    const now = new Date().toISOString();
    await (
      await db()
    ).runAsync(
      "INSERT INTO conversations (id, mode, created_at, updated_at) VALUES (?, ?, ?, ?)",
      conversationId,
      mode,
      now,
      now,
    );
  }
  return conversationId;
}

export async function saveMessage(
  conversationId: string,
  message: ChatMessage,
) {
  if (Platform.OS === "web") return;
  const database = await db();
  await database.runAsync(
    "INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)",
    message.id,
    conversationId,
    message.role,
    message.content,
    message.createdAt,
  );
  await database.runAsync(
    "UPDATE conversations SET updated_at = ? WHERE id = ?",
    message.createdAt,
    conversationId,
  );
}

export async function saveThoughtRecord(record: {
  thought: string;
  facts: string;
  assumptions: string;
  action: string;
}) {
  if (Platform.OS === "web") return;
  await (
    await db()
  ).runAsync(
    "INSERT INTO thought_records (id, thought, facts, assumptions, action, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    id("thought"),
    record.thought,
    record.facts,
    record.assumptions,
    record.action,
    new Date().toISOString(),
  );
}

export async function saveLetter(letter: Letter) {
  if (Platform.OS === "web") return;
  await (
    await db()
  ).runAsync(
    "INSERT INTO letters (id, body, created_at, deliver_at, opened_at) VALUES (?, ?, ?, ?, ?)",
    letter.id,
    letter.body,
    letter.createdAt,
    letter.deliverAt,
    letter.openedAt,
  );
}

export async function listLetters(): Promise<Letter[]> {
  if (Platform.OS === "web") return [];
  return (await db()).getAllAsync<Letter>(
    "SELECT id, body, created_at as createdAt, deliver_at as deliverAt, opened_at as openedAt FROM letters ORDER BY deliver_at ASC",
  );
}

export async function saveTrustedContact(contact: TrustedContact) {
  if (Platform.OS === "web") return;
  await (
    await db()
  ).runAsync(
    "INSERT OR REPLACE INTO trusted_contacts (id, name, relationship, phone) VALUES (?, ?, ?, ?)",
    contact.id,
    contact.name,
    contact.relationship ?? null,
    contact.phone,
  );
}

export async function listTrustedContacts(): Promise<TrustedContact[]> {
  if (Platform.OS === "web") return [];
  return (await db()).getAllAsync<TrustedContact>(
    "SELECT id, name, relationship, phone FROM trusted_contacts ORDER BY name",
  );
}

export type DayDetails = {
  journals: JournalEntry[];
  moodId: MoodId | null;
  conversations: {
    id: string;
    mode: ConversationModeId;
    messages: ChatMessage[];
  }[];
  thoughts: {
    id: string;
    thought: string;
    facts: string;
    assumptions: string;
    action: string;
  }[];
  letters: Letter[];
};

export type JourneyActivityKind =
  "journal" | "mood" | "conversation" | "thought" | "letter";

export type JourneyDaySummary = {
  date: string;
  moodId: MoodId | null;
  activities: JourneyActivityKind[];
};

type JourneyActivityRow = {
  kind: JourneyActivityKind;
  createdAt: string;
  moodId: MoodId | null;
};

function localDateKey(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function summarizeJourneyRows(rows: JourneyActivityRow[]) {
  const days = new Map<string, JourneyDaySummary>();
  rows
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .forEach((row) => {
      const date = localDateKey(row.createdAt);
      const current = days.get(date) ?? {
        date,
        moodId: null,
        activities: [],
      };
      if (!current.activities.includes(row.kind)) {
        current.activities.push(row.kind);
      }
      if (row.moodId) current.moodId = row.moodId;
      days.set(date, current);
    });
  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export async function listJourneyMonth(
  year: number,
  monthIndex: number,
): Promise<JourneyDaySummary[]> {
  const start = new Date(year, monthIndex, 1).toISOString();
  const end = new Date(year, monthIndex + 1, 1).toISOString();

  if (Platform.OS === "web") {
    const rows: JourneyActivityRow[] = [
      ...webEntries
        .filter(
          (entry) =>
            entry.body.trim() &&
            entry.createdAt >= start &&
            entry.createdAt < end,
        )
        .map((entry) => ({
          kind: "journal" as const,
          createdAt: entry.createdAt,
          moodId: entry.moodId,
        })),
      ...webMoods
        .filter((mood) => mood.createdAt >= start && mood.createdAt < end)
        .map((mood) => ({
          kind: "mood" as const,
          createdAt: mood.createdAt,
          moodId: mood.moodId,
        })),
    ];
    return summarizeJourneyRows(rows);
  }

  const ranges = [start, end, start, end, start, end, start, end, start, end];
  const rows = await (
    await db()
  ).getAllAsync<JourneyActivityRow>(
    `SELECT 'journal' AS kind, created_at AS createdAt, mood_id AS moodId
       FROM journal_entries WHERE body != '' AND created_at >= ? AND created_at < ?
     UNION ALL
     SELECT 'mood' AS kind, created_at AS createdAt, mood_id AS moodId
       FROM mood_checkins WHERE created_at >= ? AND created_at < ?
     UNION ALL
     SELECT 'conversation' AS kind, created_at AS createdAt, NULL AS moodId
       FROM conversations WHERE created_at >= ? AND created_at < ?
     UNION ALL
     SELECT 'thought' AS kind, created_at AS createdAt, NULL AS moodId
       FROM thought_records WHERE created_at >= ? AND created_at < ?
     UNION ALL
     SELECT 'letter' AS kind, created_at AS createdAt, NULL AS moodId
       FROM letters WHERE created_at >= ? AND created_at < ?
     ORDER BY createdAt`,
    ranges,
  );
  return summarizeJourneyRows(rows);
}

export async function getDayDetails(dateValue: string): Promise<DayDetails> {
  const date = new Date(`${dateValue}T00:00:00`);
  const start = date.toISOString();
  date.setDate(date.getDate() + 1);
  const end = date.toISOString();
  if (Platform.OS === "web") {
    const journals = webEntries.filter(
      (entry) => entry.createdAt >= start && entry.createdAt < end,
    );
    const mood = [...webMoods]
      .reverse()
      .find((item) => item.createdAt >= start && item.createdAt < end);
    return {
      journals,
      moodId: mood?.moodId ?? journals[0]?.moodId ?? null,
      conversations: [],
      thoughts: [],
      letters: [],
    };
  }
  const database = await db();
  const journals = (
    await database.getAllAsync<JournalRow>(
      "SELECT * FROM journal_entries WHERE created_at >= ? AND created_at < ? ORDER BY created_at",
      start,
      end,
    )
  ).map(fromRow);
  const mood = await database.getFirstAsync<{ moodId: MoodId }>(
    "SELECT mood_id as moodId FROM mood_checkins WHERE created_at >= ? AND created_at < ? ORDER BY created_at DESC LIMIT 1",
    start,
    end,
  );
  const conversationRows = await database.getAllAsync<{
    conversationId: string;
    mode: ConversationModeId;
    messageId: string | null;
    role: "user" | "reflection" | null;
    content: string | null;
    messageCreatedAt: string | null;
  }>(
    `SELECT c.id as conversationId, c.mode, m.id as messageId, m.role, m.content, m.created_at as messageCreatedAt
     FROM conversations c LEFT JOIN messages m ON m.conversation_id = c.id
     WHERE c.created_at >= ? AND c.created_at < ? ORDER BY c.created_at, m.created_at`,
    start,
    end,
  );
  const conversations = [
    ...new Set(conversationRows.map((row) => row.conversationId)),
  ].map((conversationId) => {
    const rows = conversationRows.filter(
      (row) => row.conversationId === conversationId,
    );
    return {
      id: conversationId,
      mode: rows[0].mode,
      messages: rows
        .filter(
          (row) =>
            row.messageId && row.role && row.content && row.messageCreatedAt,
        )
        .map((row) => ({
          id: row.messageId!,
          role: row.role!,
          content: row.content!,
          createdAt: row.messageCreatedAt!,
        })),
    };
  });
  const thoughts = await database.getAllAsync<{
    id: string;
    thought: string;
    facts: string;
    assumptions: string;
    action: string;
  }>(
    "SELECT id, thought, facts, assumptions, action FROM thought_records WHERE created_at >= ? AND created_at < ? ORDER BY created_at",
    start,
    end,
  );
  const letters = await database.getAllAsync<Letter>(
    "SELECT id, body, created_at as createdAt, deliver_at as deliverAt, opened_at as openedAt FROM letters WHERE created_at >= ? AND created_at < ? ORDER BY created_at",
    start,
    end,
  );
  return {
    journals,
    moodId: mood?.moodId ?? journals[0]?.moodId ?? null,
    conversations,
    thoughts,
    letters,
  };
}

async function queueSync(
  entity: string,
  entityId: string,
  operation: string,
  payload: unknown,
) {
  if (Platform.OS === "web") return;
  await (
    await db()
  ).runAsync(
    "INSERT INTO sync_queue (id, entity, entity_id, operation, payload, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    id("sync"),
    entity,
    entityId,
    operation,
    JSON.stringify(payload),
    new Date().toISOString(),
  );
}

export async function exportAllData() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    journals: await listJournals(),
    moods: await listMoodCheckIns(),
    letters: await listLetters(),
  };
}

export async function deleteAllLocalData() {
  webEntries = [];
  webMoods = [];
  if (Platform.OS === "web") return;
  const database = await db();
  await database.execAsync(`
    DELETE FROM messages; DELETE FROM conversations; DELETE FROM journal_entries;
    DELETE FROM mood_checkins; DELETE FROM letters; DELETE FROM trusted_contacts;
    DELETE FROM thought_records; DELETE FROM sync_queue;
  `);
}

export async function listPendingSyncOperations() {
  if (Platform.OS === "web") return [];
  return (await db()).getAllAsync<{
    id: string;
    entity: string;
    entityId: string;
    operation: "upsert" | "delete";
    payload: string;
    createdAt: string;
  }>(
    "SELECT id, entity, entity_id as entityId, operation, payload, created_at as createdAt FROM sync_queue ORDER BY created_at LIMIT 100",
  );
}

export async function markSyncOperationsComplete(ids: string[]) {
  if (Platform.OS === "web" || !ids.length) return;
  const database = await db();
  const statement = await database.prepareAsync(
    "DELETE FROM sync_queue WHERE id = ?",
  );
  try {
    for (const operationId of ids) await statement.executeAsync(operationId);
  } finally {
    await statement.finalizeAsync();
  }
}

export { id as createId };
