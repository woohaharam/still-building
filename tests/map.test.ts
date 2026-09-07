import { describe, expect, it } from 'vitest';
import { MapFrame, isCoord, percent, project, unproject } from '@/lib/map';
import { KOREA_FRAME, WORLD_FRAME, COUNTRY_CENTERS } from '@/lib/map-data';

/** 계산이 눈에 보이도록 딱 떨어지는 값으로 만든 지도. */
const FRAME: MapFrame = {
  width: 360,
  height: 180,
  lngLeft: -180,
  lngRight: 180,
  latTop: 90,
  latBottom: -90,
};

describe('project', () => {
  it('본초자오선과 적도가 한가운데다', () => {
    expect(project(FRAME, { lng: 0, lat: 0 })).toEqual({ x: 180, y: 90 });
  });

  it('경도는 오른쪽으로, 위도는 위로 간다', () => {
    expect(project(FRAME, { lng: -180, lat: 90 })).toEqual({ x: 0, y: 0 });
    expect(project(FRAME, { lng: 180, lat: -90 })).toEqual({ x: 360, y: 180 });
  });

  it('지도 밖이면 null', () => {
    expect(project(KOREA_FRAME, { lng: 139.7, lat: 35.7 })).toBeNull();
    expect(project(WORLD_FRAME, { lng: 0, lat: -80 })).toBeNull();
  });

  it('숫자가 아니면 null', () => {
    expect(project(FRAME, { lng: NaN, lat: 0 })).toBeNull();
    expect(project(FRAME, { lng: 0, lat: Infinity })).toBeNull();
  });
});

describe('unproject', () => {
  it('project 의 반대다', () => {
    for (const coord of [
      { lng: 0, lat: 0 },
      { lng: 126.98, lat: 37.57 },
      { lng: -74.01, lat: 40.71 },
      { lng: 151.21, lat: -33.87 },
    ]) {
      const point = project(WORLD_FRAME, coord)!;
      const back = unproject(WORLD_FRAME, point);

      expect(back.lng).toBeCloseTo(coord.lng, 6);
      expect(back.lat).toBeCloseTo(coord.lat, 6);
    }
  });

  it('한국 지도에서도 되돌아온다', () => {
    const seoul = { lng: 126.98, lat: 37.57 };
    const back = unproject(KOREA_FRAME, project(KOREA_FRAME, seoul)!);

    expect(back.lng).toBeCloseTo(seoul.lng, 6);
    expect(back.lat).toBeCloseTo(seoul.lat, 6);
  });
});

describe('percent', () => {
  it('한가운데는 50%다', () => {
    expect(percent(FRAME, { x: 180, y: 90 })).toEqual({ left: 50, top: 50 });
  });
});

describe('isCoord', () => {
  it('지구 안의 숫자만 받는다', () => {
    expect(isCoord(126.98, 37.57)).toBe(true);
    expect(isCoord(0, 0)).toBe(true);
    expect(isCoord(181, 0)).toBe(false);
    expect(isCoord(0, 91)).toBe(false);
    expect(isCoord(null, 0)).toBe(false);
    expect(isCoord('126', '37')).toBe(false);
    expect(isCoord(NaN, 0)).toBe(false);
  });
});

describe('COUNTRY_CENTERS', () => {
  it('실제 위치에 가깝다', () => {
    // 한국은 대략 127.8E 36.4N, 일본은 138E 36N 언저리다.
    expect(COUNTRY_CENTERS.KR[0]).toBeCloseTo(127.8, 0);
    expect(COUNTRY_CENTERS.KR[1]).toBeCloseTo(36.4, 0);
    expect(COUNTRY_CENTERS.JP[0]).toBeGreaterThan(135);
    expect(COUNTRY_CENTERS.JP[0]).toBeLessThan(142);
  });

  it('모든 중심점이 지구 안에 있고 세계 지도에 그려진다', () => {
    for (const [code, [lng, lat]] of Object.entries(COUNTRY_CENTERS)) {
      expect(isCoord(lng, lat), code).toBe(true);
      // 남극만 지도 밖이다. 나머지는 다 찍혀야 한다.
      if (code !== 'AQ')
        expect(project(WORLD_FRAME, { lng, lat }), code).not.toBeNull();
    }
  });
});
