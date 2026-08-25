import { describe, expect, it } from 'vitest';
import { formatCount } from '@/lib/count';

describe('formatCount', () => {
  it('천 미만은 그대로', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(1)).toBe('1');
    expect(formatCount(999)).toBe('999');
  });

  it('천 단위는 줄여서', () => {
    expect(formatCount(1000)).toBe('1천');
    expect(formatCount(1200)).toBe('1.2천');
    expect(formatCount(9900)).toBe('9.9천');
  });

  it('만 단위부터는 소수점을 뗀다', () => {
    expect(formatCount(10000)).toBe('10천');
    expect(formatCount(23400)).toBe('23천');
  });
});
