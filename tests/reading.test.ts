import { describe, expect, it } from 'vitest';
import { readingMinutes } from '@/lib/reading';

describe('readingMinutes', () => {
  it('아주 짧은 글도 최소 1분', () => {
    expect(readingMinutes('짧다')).toBe(1);
    expect(readingMinutes('')).toBe(1);
  });

  it('분당 500자로 센다', () => {
    expect(readingMinutes('가'.repeat(500))).toBe(1);
    expect(readingMinutes('가'.repeat(1500))).toBe(3);
  });

  it('코드 블록은 글자 수에서 뺀다', () => {
    const withCode =
      '가'.repeat(500) + '\n\n```ts\n' + 'x'.repeat(5000) + '\n```';
    expect(readingMinutes(withCode)).toBe(1);
  });
});
