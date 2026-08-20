const immediateRiskPatterns = [
  /muốn\s+(chết|tự\s*sát|biến\s*mất)/i,
  /không\s+muốn\s+sống/i,
  /tôi\s+sẽ\s+(tự\s*làm\s*đau|kết\s*thúc)/i,
  /không\s+thể\s+giữ\s+(mình|bản thân)\s+an\s+toàn/i,
  /đã\s+có\s+kế\s+hoạch\s+tự\s*sát/i,
  /kill\s+myself|end\s+my\s+life|can't\s+stay\s+safe/i,
];

export function mayNeedImmediateSupport(text: string) {
  return immediateRiskPatterns.some((pattern) => pattern.test(text));
}

export const safetyMessage =
  'Điều bạn vừa nói khiến mình lo rằng lúc này bạn có thể không an toàn. Mình sẽ không tiếp tục gỡ rối như bình thường. Hãy ở gần một người bạn tin, rời xa những thứ có thể làm bạn bị thương, và chọn một cách liên hệ hỗ trợ ngay bên dưới.';
