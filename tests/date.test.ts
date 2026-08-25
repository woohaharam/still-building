import { describe, expect, it } from 'vitest';
import { formatDate } from '@/lib/date';

describe('formatDate', () => {
  it('한국어 날짜로 적는다', () => {
    expect(formatDate('2026-08-25T12:00:00')).toBe('2026년 8월 25일');
  });

  it('한 자리 월·일에 0을 붙이지 않는다', () => {
    expect(formatDate('2026-01-05T12:00:00')).toBe('2026년 1월 5일');
  });

  it('값이 없으면 빈 문자열', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate('')).toBe('');
  });
});
