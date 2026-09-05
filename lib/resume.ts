import { isPositive, sortByRecent } from './activity';
import { DateKey, formatMonthLabel, toDateKey } from './calendar';
import { SERVICE, serviceStatus } from './service';
import { Activity } from './types';

export interface MilitaryLine {
  branch: string;
  /** '2025.07 — 2027.04' */
  period: string;
  /** '복무 중' 또는 '만기 전역'. */
  status: string;
}

/**
 * 이력서의 병역 칸.
 *
 * 전역일이 지나면 표기가 저절로 '만기 전역'으로 바뀐다. 이력서를 낼 때마다
 * 손으로 고쳐야 하는 자리는 결국 안 고친 채로 나간다.
 */
export function militaryService(
  today: DateKey = toDateKey(new Date())
): MilitaryLine {
  const status = serviceStatus(today);

  return {
    branch: SERVICE.branch,
    period: `${formatMonthLabel(SERVICE.enlistedOn)} — ${formatMonthLabel(SERVICE.dischargeOn)}`,
    status: status.discharged ? '만기 전역' : '복무 중',
  };
}

/**
 * 이력서에 실을 활동만 고른다.
 *
 * /activities 에서는 떨어진 것도 보여준다. 그래야 몇 번 시도했는지가 남는다.
 * 이력서는 성격이 다르다. 지원만 하고 끝난 줄이 섞이면 실제로 한 활동이
 * 그만큼 묻힌다. 그래서 여기서는 활동한 것만 남긴다.
 */
export function resumeActivities(activities: Activity[]): Activity[] {
  return sortByRecent(activities.filter((a) => isPositive(a.outcome)));
}

/** 주소에서 프로토콜과 끝 슬래시를 뗀 표기. 이력서에는 주소가 그대로 적혀야 한다. */
export function bareUrl(href: string): string {
  return href.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

/**
 * 밖으로 나가는 링크만.
 *
 * 프로젝트 링크에는 '/blog' 같은 사이트 안쪽 주소도 섞여 있다. 종이에 찍힌
 * 이력서에서 그건 누를 수도, 어디인지 알 수도 없는 글자다.
 */
export function externalLinks<T extends { href: string }>(links: T[]): T[] {
  return links.filter((link) => /^https?:\/\//.test(link.href));
}
