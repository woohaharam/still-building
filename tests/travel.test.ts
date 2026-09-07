import { describe, expect, it } from 'vitest';
import {
  nightsAndDays,
  splitByRegion,
  stayLabel,
  tripCoord,
  tripPins,
  uniqueCountries,
} from '@/lib/travel';
import { KOREA_FRAME, WORLD_FRAME } from '@/lib/map-data';
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
    lng: null,
    lat: null,
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

describe('tripCoord', () => {
  it('적어둔 좌표가 먼저다', () => {
    expect(tripCoord(trip({ lng: 135.5, lat: 34.69 }))).toEqual({
      lng: 135.5,
      lat: 34.69,
    });
  });

  it('좌표가 없으면 나라 중심점을 쓴다', () => {
    const point = tripCoord(trip({ country_code: 'KR', lng: null, lat: null }));

    expect(point!.lng).toBeCloseTo(127.8, 0);
    expect(point!.lat).toBeCloseTo(36.4, 0);
  });

  it('한쪽만 적힌 좌표는 못 쓴다. 나라 중심점으로 내려간다', () => {
    const point = tripCoord(
      trip({ country_code: 'JP', lng: 135.5, lat: null })
    );

    expect(point!.lng).toBeCloseTo(136.9, 0);
  });

  it('나라 코드가 소문자여도 찾는다', () => {
    expect(
      tripCoord(trip({ country_code: 'kr', lng: null, lat: null }))
    ).not.toBeNull();
  });

  it('모르는 나라 코드면 null', () => {
    expect(
      tripCoord(trip({ country_code: 'ZZ', lng: null, lat: null }))
    ).toBeNull();
  });

  it('프로토타입에 있는 이름이 좌표인 척하지 못한다', () => {
    expect(
      tripCoord(trip({ country_code: 'constructor', lng: null, lat: null }))
    ).toBeNull();
  });
});

describe('tripPins', () => {
  it('같은 자리에 겹친 여행은 하나로 접고 수를 센다', () => {
    const pins = tripPins(WORLD_FRAME, [
      trip({ id: '1', slug: 'a', lng: 135.5, lat: 34.69 }),
      trip({ id: '2', slug: 'b', lng: 135.5, lat: 34.69 }),
      trip({ id: '3', slug: 'c', lng: 2.35, lat: 48.86 }),
    ]);

    expect(pins).toHaveLength(2);
    expect(pins[0].trip.id).toBe('1');
    expect(pins[0].also).toBe(1);
    expect(pins[1].also).toBe(0);
  });

  it('지도 밖의 여행은 빠진다', () => {
    const pins = tripPins(KOREA_FRAME, [
      trip({ id: '1', slug: 'a', country_code: 'KR', lng: 126.98, lat: 37.57 }),
      trip({ id: '2', slug: 'b', country_code: 'JP', lng: 139.7, lat: 35.69 }),
    ]);

    expect(pins).toHaveLength(1);
    expect(pins[0].trip.id).toBe('1');
  });

  it('찍을 자리가 없으면 빈 배열', () => {
    expect(
      tripPins(WORLD_FRAME, [
        trip({ country_code: 'ZZ', lng: null, lat: null }),
      ])
    ).toHaveLength(0);
  });
});
