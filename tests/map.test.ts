import { describe, expect, it } from 'vitest';
import { isCoord } from '@/lib/map';
import { COUNTRY_CENTERS } from '@/lib/map-data';

describe('isCoord', () => {
  it('지구 안의 숫자만 받는다', () => {
    expect(isCoord(126.98, 37.57)).toBe(true);
    expect(isCoord(0, 0)).toBe(true);
    expect(isCoord(181, 0)).toBe(false);
    expect(isCoord(0, 91)).toBe(false);
  });

  it('숫자가 아니거나 비어 있으면 안 받는다', () => {
    expect(isCoord(null, 0)).toBe(false);
    expect(isCoord('126', '37')).toBe(false);
    expect(isCoord(NaN, 0)).toBe(false);
    expect(isCoord(126.98, undefined)).toBe(false);
  });
});

describe('COUNTRY_CENTERS', () => {
  it('실제 위치에 가깝다', () => {
    expect(COUNTRY_CENTERS.KR[0]).toBeCloseTo(127.8, 0);
    expect(COUNTRY_CENTERS.KR[1]).toBeCloseTo(36.4, 0);
    expect(COUNTRY_CENTERS.JP[0]).toBeCloseTo(136.9, 0);
  });

  it('날짜변경선을 넘는 나라도 제자리에 있다', () => {
    // 이어붙이지 않고 평균을 내면 러시아가 202도, 피지가 11도로 나온다.
    expect(COUNTRY_CENTERS.RU[0]).toBeGreaterThan(60);
    expect(COUNTRY_CENTERS.RU[0]).toBeLessThan(140);
    expect(COUNTRY_CENTERS.FJ[0]).toBeGreaterThan(170);
  });

  it('모든 중심점이 지구 안에 있다', () => {
    for (const [code, [lng, lat]] of Object.entries(COUNTRY_CENTERS)) {
      expect(isCoord(lng, lat), code).toBe(true);
    }
  });
});
