export type MoodId = 'peaceful' | 'okay' | 'empty' | 'sad' | 'tired' | 'angry' | 'anxious' | 'unsure';

export type Mood = {
  id: MoodId;
  emoji: string;
  label: string;
  weather: string;
};

export type JournalEntry = {
  id: string;
  body: string;
  moodId: MoodId | null;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
};

export type ConversationModeId = 'mirror' | 'tomorrow' | 'untangle' | 'listen';
export type ConversationMode = {
  id: ConversationModeId;
  emoji: string;
  title: string;
  description: string;
};

export type ResponseIntentId = 'listen' | 'understand' | 'untangle' | 'perspective' | 'next-step';
export type ResponseIntent = { id: ResponseIntentId; label: string };

export type ChatMessage = {
  id: string;
  role: 'user' | 'reflection';
  content: string;
  createdAt: string;
};

export type TrustedContact = { id: string; name: string; relationship?: string; phone: string };

export type Letter = {
  id: string;
  body: string;
  createdAt: string;
  deliverAt: string;
  openedAt: string | null;
};
