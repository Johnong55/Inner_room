import { listJournals } from '@/database';
import type { ChatMessage, ConversationModeId, ResponseIntentId } from '@/types';
import { mayNeedImmediateSupport, safetyMessage } from './safety';

type ReflectionRequest = {
  mode: ConversationModeId;
  intent: ResponseIntentId;
  messages: ChatMessage[];
  memoryEnabled: boolean;
  anonymousMode: boolean;
};

type ReflectionResponse = { content: string; safetyEscalation: boolean; usedJournalIds: string[] };

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

function localReflection(text: string, mode: ConversationModeId, intent: ResponseIntentId) {
  if (intent === 'listen' || mode === 'listen') {
    return `Mình đang nghe. Có vẻ “${text.length > 90 ? `${text.slice(0, 87)}…` : text}” vẫn còn nhiều điều ở phía sau. Bạn có thể kể tiếp, không cần sắp xếp cho gọn.`;
  }
  if (mode === 'tomorrow' || intent === 'perspective') {
    return 'Nếu tạm lùi lại khỏi hôm nay một chút, có phần nào của chuyện này có thể nhỏ hơn cảm giác mà nó đang tạo ra lúc này không?';
  }
  if (mode === 'untangle' || intent === 'untangle') {
    return 'Mình nghe thấy nhiều lớp đang chồng lên nhau. Trước hết, đâu là một sự việc đã thực sự xảy ra — chưa thêm vào điều bạn sợ nó có nghĩa là gì?';
  }
  if (intent === 'next-step') {
    return 'Mình không nghĩ bạn cần giải quyết tất cả ngay. Việc nào đủ nhỏ để làm trong khoảng mười phút và chỉ khiến chuyện này nhẹ đi một chút?';
  }
  return 'Có vẻ điều làm bạn nặng lòng không chỉ là chuyện đã xảy ra, mà còn là ý nghĩa bạn đang đặt lên nó. Phần nào là sự thật bạn biết, và phần nào là điều bạn đang lo sẽ xảy ra?';
}

export async function requestReflection(request: ReflectionRequest): Promise<ReflectionResponse> {
  const latestText = [...request.messages].reverse().find((message) => message.role === 'user')?.content ?? '';
  if (mayNeedImmediateSupport(latestText)) return { content: safetyMessage, safetyEscalation: true, usedJournalIds: [] };

  const journals = request.memoryEnabled ? (await listJournals()).slice(0, 5) : [];
  if (!apiUrl) {
    await new Promise((resolve) => setTimeout(resolve, 520));
    return { content: localReflection(latestText, request.mode, request.intent), safetyEscalation: false, usedJournalIds: [] };
  }

  const response = await fetch(`${apiUrl}/v1/reflections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: request.mode,
      intent: request.intent,
      messages: request.messages.slice(-12).map(({ role, content }) => ({ role, content })),
      journalContext: journals.map(({ id, createdAt, body }) => ({ id, createdAt, body: body.slice(0, 1800) })),
      anonymousMode: request.anonymousMode,
    }),
  });
  if (!response.ok) throw new Error('REFLECTION_UNAVAILABLE');
  return response.json() as Promise<ReflectionResponse>;
}
