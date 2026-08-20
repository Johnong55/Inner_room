import OpenAI from 'openai';
import { config } from '../config.js';

const client = config.OPENAI_API_KEY ? new OpenAI({ apiKey: config.OPENAI_API_KEY }) : null;

function cosine(a: number[], b: number[]) {
  let dot = 0; let aa = 0; let bb = 0;
  for (let index = 0; index < a.length; index += 1) { dot += a[index] * b[index]; aa += a[index] ** 2; bb += b[index] ** 2; }
  return dot / (Math.sqrt(aa) * Math.sqrt(bb));
}

export async function semanticSearch(query: string, entries: { id: string; body: string }[]) {
  if (!client) throw Object.assign(new Error('AI_NOT_CONFIGURED'), { status: 503 });
  const response = await client.embeddings.create({ model: 'text-embedding-3-small', input: [query, ...entries.map((entry) => entry.body)], encoding_format: 'float' });
  const queryVector = response.data[0].embedding;
  return entries.map((entry, index) => ({ id: entry.id, score: cosine(queryVector, response.data[index + 1].embedding) })).filter((match) => match.score >= 0.22).sort((a, b) => b.score - a.score).slice(0, 12);
}
