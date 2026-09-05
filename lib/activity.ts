import { Activity, ActivityOutcome } from './types';

/**
 * 지원 기록 요약.
 *
 * 붙은 것만 세면 지원한 횟수가 사라진다. 몇 번 넣어서 몇 번 됐는지를
 * 같이 보여주려고 둘 다 센다.
 */
export function summarize(activities: Activity[]) {
  const applied = activities.length;
  const engaged = activities.filter(
    (a) => a.outcome === 'done' || a.outcome === 'ongoing'
  ).length;

  return { applied, engaged };
}

/**
 * 최근 시작한 것부터. 같은 날이면 이름순으로 고정한다.
 *
 * 정렬 기준을 하나만 두면 같은 날 항목의 순서가 조회할 때마다 달라져서,
 * 새로고침할 때마다 목록이 흔들린다.
 */
export function sortByRecent(activities: Activity[]): Activity[] {
  return [...activities].sort(
    (a, b) =>
      b.started_on.localeCompare(a.started_on) || a.name.localeCompare(b.name)
  );
}

/** 연도별로 묶는다. 최근 연도부터. */
export function groupByYear(
  activities: Activity[]
): { year: string; items: Activity[] }[] {
  const groups = new Map<string, Activity[]>();

  for (const activity of sortByRecent(activities)) {
    const year = activity.started_on.slice(0, 4);
    const bucket = groups.get(year);
    if (bucket) bucket.push(activity);
    else groups.set(year, [activity]);
  }

  return [...groups].map(([year, items]) => ({ year, items }));
}

/**
 * 기간 표기. 끝난 날이 없거나 같은 달이면 시작만 보여준다.
 * 'YYYY.MM' 까지만 쓴다. 활동은 날짜보다 어느 달이었는지가 중요하다.
 */
export function periodLabel(activity: Activity): string {
  const start = monthLabel(activity.started_on);
  if (!activity.ended_on) return start;

  const end = monthLabel(activity.ended_on);
  return start === end ? start : `${start} — ${end}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-');
  return `${year}.${month}`;
}

/** 결과가 좋은 쪽인지. 화면에서 강조할지 정할 때 쓴다. */
export function isPositive(outcome: ActivityOutcome): boolean {
  return outcome === 'done' || outcome === 'ongoing';
}
