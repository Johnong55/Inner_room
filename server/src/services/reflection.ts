import OpenAI from 'openai';
import { config } from '../config.js';
import { hasImmediateRiskLanguage, safetyResponse } from './safety.js';

type ReflectionInput = {
  mode: 'mirror' | 'tomorrow' | 'untangle' | 'listen';
  intent: 'listen' | 'understand' | 'untangle' | 'perspective' | 'next-step';
  messages: { role: 'user' | 'reflection'; content: string }[];
  journalContext: { id: string; createdAt: string; body: string }[];
  safetyIdentifier: string;
};

const client = config.OPENAI_API_KEY ? new OpenAI({ apiKey: config.OPENAI_API_KEY }) : null;

const modeGuidance = {
  mirror: 'Phản chiếu suy nghĩ và cảm xúc. Chưa đưa lời khuyên.',
  tomorrow: 'Đưa một góc nhìn bình tĩnh hơn từ khoảng cách thời gian, nhưng không tự nhận là tương lai thật của người dùng.',
  untangle: 'Giúp tách: sự việc, cảm xúc, nỗi sợ, điều kiểm soát được, điều không kiểm soát được, và chỉ một bước nhỏ.',
  listen: 'Chỉ lắng nghe và giúp người dùng nói tiếp. Không giải pháp hoặc lời khuyên trừ khi họ yêu cầu rõ.',
};

const intentGuidance = {
  listen: 'Chỉ nghe tôi nói.', understand: 'Giúp tôi hiểu cảm xúc này.', untangle: 'Giúp tôi gỡ rối.', perspective: 'Cho tôi một góc nhìn khác.', 'next-step': 'Giúp tôi tìm đúng một bước tiếp theo.',
};

export async function reflect(input: ReflectionInput) {
  const latest = [...input.messages].reverse().find((message) => message.role === 'user')?.content ?? '';
  if (hasImmediateRiskLanguage(latest)) return safetyResponse;
  if (!client) throw Object.assign(new Error('AI_NOT_CONFIGURED'), { status: 503 });

  const moderation = await client.moderations.create({ model: 'omni-moderation-latest', input: latest });
  const categories = moderation.results[0]?.categories;
  if (categories?.['self-harm/intent'] || categories?.['self-harm/instructions']) return safetyResponse;

  const journals = input.journalContext.map((entry) => `[${entry.id} · ${entry.createdAt}] ${entry.body}`).join('\n\n');
  const instructions = `Bạn là phần phản chiếu trong InnerRoom, nói tiếng Việt tự nhiên, ấm nhưng không sáo rỗng.
Bạn không phải bác sĩ hoặc nhà trị liệu. Không chẩn đoán, không gán nhãn, không nói "bạn luôn...", không ép tích cực.
Trình tự mặc định: lắng nghe → phản chiếu điều cụ thể → hỏi đúng một câu có chiều sâu. Chỉ gợi ý khi intent yêu cầu.
Mode: ${modeGuidance[input.mode]}
Mong muốn hiện tại: ${intentGuidance[input.intent]}
Nếu dùng journal, chỉ nói "Có một điều mình nhận thấy...", nêu ngày, và không suy diễn ngoài nội dung. Không bịa ký ức.
Nếu người dùng có thể đang gặp nguy hiểm tức thời, không tiếp tục phản chiếu: bình tĩnh khuyên ở gần người tin cậy và tìm hỗ trợ khẩn cấp.
Viết ngắn, thường 2 đoạn, không mở đầu bằng một câu xin lỗi chung chung.`;

  const response = await client.responses.create({
    model: config.OPENAI_MODEL,
    store: false,
    safety_identifier: input.safetyIdentifier,
    instructions,
    input: [
      ...(journals ? [{ role: 'developer' as const, content: `Ngữ cảnh nhật ký do người dùng chủ động cho phép:\n${journals}` }] : []),
      ...input.messages.map((message) => ({ role: message.role === 'reflection' ? 'assistant' as const : 'user' as const, content: message.content })),
    ],
    reasoning: { effort: 'low' },
    text: { verbosity: 'low' },
  });
  return { content: response.output_text.trim(), safetyEscalation: false, usedJournalIds: input.journalContext.map((entry) => entry.id) };
}
