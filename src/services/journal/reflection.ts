import type { JournalEntry } from '@/types';

const topics = [
  { label: 'Công việc', words: ['công việc', 'deadline', 'sếp', 'đồng nghiệp', 'làm việc'] },
  { label: 'Tương lai', words: ['tương lai', 'sau này', 'không biết', 'lựa chọn'] },
  { label: 'Các mối quan hệ', words: ['gia đình', 'bạn bè', 'người yêu', 'mối quan hệ', 'cô đơn'] },
  { label: 'Việc học', words: ['học', 'thi', 'bài tập', 'trường'] },
  { label: 'Sự nghỉ ngơi', words: ['ngủ', 'nghỉ', 'mệt', 'kiệt sức'] },
];

const easingWords = ['nhẹ', 'yên', 'dễ chịu', 'biết ơn', 'cười', 'vui', 'đỡ hơn', 'nghỉ'];

export function buildMonthlyReflection(entries: JournalEntry[]) {
  const text = entries.map((entry) => entry.body.toLocaleLowerCase('vi')).join('\n');
  const mentionedTopics = topics
    .map((topic) => ({ label: topic.label, count: topic.words.reduce((sum, word) => sum + text.split(word).length - 1, 0) }))
    .filter((topic) => topic.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  const easingEntries = entries.filter((entry) => easingWords.some((word) => entry.body.toLocaleLowerCase('vi').includes(word))).slice(0, 2);
  const favorite = entries.find((entry) => entry.isFavorite);
  return { mentionedTopics, easingEntries, favorite };
}
