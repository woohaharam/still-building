import { isDomestic } from './country';
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
