import type { ConversationMode, Mood, ResponseIntent } from '@/types';

export const moods: Mood[] = [
  { id: 'peaceful', label: 'Bình yên' },
  { id: 'okay', label: 'Ổn' },
  { id: 'empty', label: 'Trống rỗng' },
  { id: 'sad', label: 'Buồn' },
  { id: 'tired', label: 'Mệt' },
  { id: 'angry', label: 'Bực bội' },
  { id: 'anxious', label: 'Lo lắng' },
  { id: 'unsure', label: 'Không biết nữa' },
];

export const journalPrompts = [
  'Điều gì khiến bạn mệt nhất hôm nay?',
  'Có điều gì bạn đang cố giấu khỏi chính mình không?',
  'Điều gì nằm ngoài khả năng kiểm soát của bạn?',
  'Điều gì vẫn còn nằm trong tay bạn?',
  'Nếu không cần phải tỏ ra mạnh mẽ, bạn muốn nói gì?',
  'Có chuyện gì bạn đang suy nghĩ nhiều hơn mức nó xứng đáng?',
  'Bạn đang thực sự muốn điều gì?',
];

export const conversationModes: ConversationMode[] = [
  { id: 'mirror', title: 'Gương', description: 'Chỉ giúp tôi hiểu điều tôi đang nghĩ.' },
  { id: 'tomorrow', title: 'Tôi của ngày mai', description: 'Một góc nhìn bình tĩnh hơn, không giả vờ biết tương lai.' },
  { id: 'untangle', title: 'Gỡ rối', description: 'Sắp xếp những điều đang chen nhau trong đầu.' },
  { id: 'listen', title: 'Chỉ muốn nói thôi', description: 'Không giải quyết. Không khuyên, trừ khi bạn hỏi.' },
];

export const responseIntents: ResponseIntent[] = [
  { id: 'listen', label: 'Chỉ nghe tôi nói' },
  { id: 'understand', label: 'Giúp tôi hiểu cảm xúc này' },
  { id: 'untangle', label: 'Giúp tôi gỡ rối' },
  { id: 'perspective', label: 'Cho tôi một góc nhìn khác' },
  { id: 'next-step', label: 'Giúp tôi tìm một bước tiếp theo' },
];
