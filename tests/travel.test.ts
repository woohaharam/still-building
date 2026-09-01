import { describe, expect, it } from 'vitest';
import {
  nightsAndDays,
  splitByRegion,
  stayLabel,
  uniqueCountries,
} from '@/lib/travel';
import { Trip } from '@/lib/types';

function trip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: '1',
    slug: 'osaka',
    place: '오사카',
    country_code: 'JP',
    started_on: '2026-08-14',
    ended_on: '2026-08-16',
    cover_image_url: null,
    journal: '본문',
    published: true,
    created_at: '2026-08-14T00:00:00Z',
    ...overrides,
  };
}

describe('uniqueCountries', () => {
  it('같은 나라는 한 번만 센다', () => {
    const list = [
      trip({ id: '1', country_code: 'JP' }),
      trip({ id: '2', country_code: 'KR' }),
      trip({ id: '3', country_code: 'JP' }),
    ];
    expect(uniqueCountries(list)).toEqual(['JP', 'KR']);
  });

  it('대소문자가 달라도 같은 나라로 본다', () => {
    const list = [
      trip({ id: '1', country_code: 'jp' }),
      trip({ id: '2', country_code: 'JP' }),
    ];
    expect(uniqueCountries(list)).toEqual(['JP']);
  });

  it('받은 순서를 지킨다', () => {
    const list = [
      trip({ id: '1', country_code: 'FR' }),
      trip({ id: '2', country_code: 'JP' }),
    ];
    expect(uniqueCountries(list)).toEqual(['FR', 'JP']);
  });

  it('빈 목록은 빈 배열이다', () => {
    expect(uniqueCountries([])).toEqual([]);
  });
});

describe('splitByRegion', () => {
  it('한국만 국내로 가른다', () => {
    const list = [
      trip({ id: '1', country_code: 'KR', place: '제주' }),
      trip({ id: '2', country_code: 'JP', place: '오사카' }),
      trip({ id: '3', country_code: 'kr', place: '부산' }),
    ];
    const { domestic, abroad } = splitByRegion(list);
    expect(domestic.map((t) => t.place)).toEqual(['제주', '부산']);
    expect(abroad.map((t) => t.place)).toEqual(['오사카']);
  });
});

describe('nightsAndDays', () => {
  it('2박 3일을 센다', () => {
    expect(nightsAndDays('2026-08-14', '2026-08-16')).toEqual({
      nights: 2,
      days: 3,
    });
  });

  it('끝난 날이 없으면 당일치기다', () => {
    expect(nightsAndDays('2026-08-14', null)).toEqual({ nights: 0, days: 1 });
  });

  it('같은 날이면 0박 1일이다', () => {
    expect(nightsAndDays('2026-08-14', '2026-08-14')).toEqual({
      nights: 0,
      days: 1,
    });
  });

  it('달과 해를 넘어가도 센다', () => {
    expect(nightsAndDays('2026-12-30', '2027-01-02').nights).toBe(3);
  });

  it('끝난 날이 더 빠르면 당일치기로 본다', () => {
    // DB 가 막지만 옛 데이터가 어긋나 있을 수 있다. 음수를 화면에 내보내지 않는다.
    expect(nightsAndDays('2026-08-16', '2026-08-14')).toEqual({
      nights: 0,
      days: 1,
    });
  });
});

describe('stayLabel', () => {
  it('박과 일을 붙여 읽는다', () => {
    expect(stayLabel('2026-08-14', '2026-08-16')).toBe('2박 3일');
    expect(stayLabel('2026-08-14', null)).toBe('당일치기');
    expect(stayLabel('2026-08-14', '2026-08-14')).toBe('당일치기');
  });
});
