import { isDomestic } from './country';
import { COUNTRY_CENTERS } from './map-data';
import { Coord, MapFrame, Point, isCoord, project } from './map';
import { Trip } from './types';

/**
 * 나라별로 한 번씩만. 목록에 국기를 늘어놓을 때 쓴다.
 * 여러 번 간 나라를 여러 번 그리면 몇 나라를 갔는지가 안 보인다.
 *
 * trips 가 최근순으로 들어오므로 결과도 최근에 간 나라부터다.
 */
export function uniqueCountries(trips: Trip[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const trip of trips) {
    const code = trip.country_code.trim().toUpperCase();
    if (!code || seen.has(code)) continue;
    seen.add(code);
    out.push(code);
  }

  return out;
}

/** 국내와 해외로 가른다. 순서는 받은 그대로 둔다. */
export function splitByRegion(trips: Trip[]): {
  domestic: Trip[];
  abroad: Trip[];
} {
  return {
    domestic: trips.filter((trip) => isDomestic(trip.country_code)),
    abroad: trips.filter((trip) => !isDomestic(trip.country_code)),
  };
}

/**
 * 머문 날 수. 끝난 날이 없으면 당일치기라 하루다.
 * 날짜 문자열을 직접 쪼갠다. new Date('2026-08-19') 는 UTC 자정으로 읽혀서
 * 시간대에 따라 하루씩 밀린다 (lib/calendar.ts 와 같은 이유).
 */
export function nightsAndDays(
  startedOn: string,
  endedOn: string | null
): { nights: number; days: number } {
  if (!endedOn) return { nights: 0, days: 1 };

  const start = Date.UTC(...split(startedOn));
  const end = Date.UTC(...split(endedOn));
  const nights = Math.round((end - start) / 86400000);

  if (!Number.isFinite(nights) || nights < 0) return { nights: 0, days: 1 };
  return { nights, days: nights + 1 };
}

function split(key: string): [number, number, number] {
  const [y, m, d] = key.split('-').map(Number);
  return [y || 1970, (m || 1) - 1, d || 1];
}

/** '2박 3일', 당일치기면 '당일치기'. */
export function stayLabel(startedOn: string, endedOn: string | null): string {
  const { nights, days } = nightsAndDays(startedOn, endedOn);
  return nights === 0 ? '당일치기' : `${nights}박 ${days}일`;
}

/**
 * 핀을 찍을 자리. 적어둔 좌표가 먼저고, 없으면 나라 중심점이다.
 *
 * 나라 중심점으로 떨어뜨리는 건 어림이지만, 좌표를 안 적었다고 지도에서
 * 아예 빠지는 것보다 낫다. 세계 지도에서는 어느 나라였는지만 보이면 된다.
 * 나라 안 어디였는지가 중요한 국내 여행은 좌표를 적으면 그쪽이 이긴다.
 */
export function tripCoord(trip: Trip): Coord | null {
  if (isCoord(trip.lng, trip.lat)) {
    return { lng: trip.lng as number, lat: trip.lat as number };
  }

  const code = trip.country_code.trim().toUpperCase();
  // country_code 는 DB 에서 온 문자열이다. 대괄호로 바로 꺼내면 프로토타입에
  // 있는 이름이 좌표인 척 딸려 나온다.
  if (!Object.prototype.hasOwnProperty.call(COUNTRY_CENTERS, code)) return null;

  const [lng, lat] = COUNTRY_CENTERS[code];
  return { lng, lat };
}

/**
 * 지도에 얹을 핀들. 지도 밖으로 나가는 여행은 빠진다.
 *
 * 같은 자리에 여러 번 갔으면 핀도 여러 개가 겹친다. 겹친 핀은 화면에서
 * 하나처럼 보이고 맨 위의 것만 눌린다. 그래서 자리마다 하나로 접고, 접힌
 * 여행 수를 같이 넘긴다.
 */
export function tripPins(frame: MapFrame, trips: Trip[]): TripPin[] {
  const byPlace = new Map<string, TripPin>();

  for (const trip of trips) {
    const coord = tripCoord(trip);
    if (!coord) continue;

    const point = project(frame, coord);
    if (!point) continue;

    // 반올림해서 묶는다. 몇 픽셀 차이는 화면에서 어차피 한 점이다.
    const key = `${Math.round(point.x)},${Math.round(point.y)}`;
    const found = byPlace.get(key);

    if (found) found.also += 1;
    else byPlace.set(key, { trip, point, also: 0 });
  }

  return [...byPlace.values()];
}

export interface TripPin {
  /** 그 자리에서 가장 최근 여행. 핀을 누르면 이리로 간다. */
  trip: Trip;
  point: Point;
  /** 같은 자리에 겹친 다른 여행의 수. 0 이면 하나뿐이다. */
  also: number;
}
