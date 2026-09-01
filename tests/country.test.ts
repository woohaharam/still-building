import { describe, expect, it } from 'vitest';
import {
  countryName,
  flagEmoji,
  isCountryCode,
  isDomestic,
} from '@/lib/country';

describe('flagEmoji', () => {
  it('국가 코드를 국기로 바꾼다', () => {
    expect(flagEmoji('KR')).toBe('🇰🇷');
    expect(flagEmoji('JP')).toBe('🇯🇵');
    expect(flagEmoji('US')).toBe('🇺🇸');
  });

  it('소문자와 앞뒤 공백을 받아준다', () => {
    expect(flagEmoji('kr')).toBe('🇰🇷');
    expect(flagEmoji('  jp  ')).toBe('🇯🇵');
  });

  it('두 글자가 아니면 빈 문자열이다', () => {
    for (const bad of ['', 'K', 'KOR', '한국', '1A', 'K1']) {
      expect(flagEmoji(bad)).toBe('');
    }
  });
});

describe('countryName', () => {
  it('한글 나라 이름을 낸다', () => {
    expect(countryName('JP')).toBe('일본');
    expect(countryName('KR')).toBe('대한민국');
    expect(countryName('FR')).toBe('프랑스');
  });

  it('모르는 코드는 안내 문구 대신 코드를 그대로 보여준다', () => {
    // '알려지지 않은 지역' 이 화면에 뜨는 것보다 코드가 낫다.
    expect(countryName('ZZ')).toBe('ZZ');
  });

  it('코드 꼴이 아니면 받은 값을 그대로 돌려준다', () => {
    expect(countryName('한국')).toBe('한국');
  });
});

describe('isDomestic', () => {
  it('한국만 국내로 본다', () => {
    expect(isDomestic('KR')).toBe(true);
    expect(isDomestic('kr')).toBe(true);
    expect(isDomestic('JP')).toBe(false);
  });
});

describe('isCountryCode', () => {
  it('두 글자 알파벳만 통과시킨다', () => {
    expect(isCountryCode('KR')).toBe(true);
    expect(isCountryCode('kr')).toBe(true);
    expect(isCountryCode('KOR')).toBe(false);
    expect(isCountryCode('')).toBe(false);
  });
});
