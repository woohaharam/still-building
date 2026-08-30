import { describe, expect, it } from 'vitest';
import { isRating, ratingLabel, stars } from '@/lib/rating';

describe('stars', () => {
  it('채운 별과 빈 별을 합쳐 다섯 개를 만든다', () => {
    expect(stars(1)).toBe('★☆☆☆☆');
    expect(stars(3)).toBe('★★★☆☆');
    expect(stars(5)).toBe('★★★★★');
  });

  it('별점이 없으면 빈 문자열이다', () => {
    expect(stars(null)).toBe('');
  });

  it('범위를 벗어난 값에는 별을 안 그린다', () => {
    // 별을 0개나 100개 그리느니 아무것도 안 그리는 쪽이 낫다.
    expect(stars(0)).toBe('');
    expect(stars(6)).toBe('');
    expect(stars(-1)).toBe('');
  });

  it('정수가 아니면 안 그린다', () => {
    expect(stars(3.5)).toBe('');
    expect(stars(NaN)).toBe('');
  });
});

describe('isRating', () => {
  it('1부터 5까지만 통과시킨다', () => {
    for (const n of [1, 2, 3, 4, 5]) expect(isRating(n)).toBe(true);
    for (const n of [0, 6, -1, 3.5, NaN]) expect(isRating(n)).toBe(false);
    expect(isRating(null)).toBe(false);
  });
});

describe('ratingLabel', () => {
  it('읽어줄 문구를 만든다', () => {
    expect(ratingLabel(4)).toBe('5점 만점에 4점');
  });

  it('별점이 없으면 비운다', () => {
    expect(ratingLabel(null)).toBe('');
    expect(ratingLabel(9)).toBe('');
  });
});
