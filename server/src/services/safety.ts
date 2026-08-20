const riskPatterns = [/muốn\s+(chết|tự\s*sát|biến\s*mất)/i, /không\s+muốn\s+sống/i, /không\s+thể\s+giữ\s+(mình|bản thân)\s+an\s+toàn/i, /kill\s+myself|end\s+my\s+life|can't\s+stay\s+safe/i];

export const safetyResponse = {
  content: 'Điều bạn vừa nói khiến mình lo rằng lúc này bạn có thể không an toàn. Mình sẽ dừng việc gỡ rối. Hãy đến gần một người bạn tin và cho họ biết bạn cần họ ở lại; nếu nguy hiểm đang xảy ra, hãy gọi hỗ trợ khẩn cấp tại nơi bạn đang ở.',
  safetyEscalation: true,
  usedJournalIds: [],
};

export const hasImmediateRiskLanguage = (text: string) => riskPatterns.some((pattern) => pattern.test(text));
