import { describe, expect, it } from 'vitest';
import { hasImmediateRiskLanguage } from './safety.js';

describe('immediate risk language', () => {
  it('routes explicit inability to stay safe to support', () => {
    expect(hasImmediateRiskLanguage('Tôi không thể giữ bản thân an toàn lúc này')).toBe(true);
  });
  it('does not turn ordinary sadness into a crisis label', () => {
    expect(hasImmediateRiskLanguage('Hôm nay tôi buồn và rất mệt')).toBe(false);
  });
});
