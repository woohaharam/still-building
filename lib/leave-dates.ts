import { DateKey, parseDateKey, toDateKey } from './calendar';
import { Leave } from './types';

/**
 * 나가는 일정의 날짜 계산.
 *
 * lib/leaves.ts 는 Supabase 클라이언트를 불러오는데, 그 클라이언트는 import
 * 만 해도 환경변수를 요구해서 키가 없는 곳(테스트)에서는 터진다. 그래서
 * 순수한 부분만 갈라뒀다 (lib/count.ts 와 같은 이유).
 */

/**
 * 걸쳐 있는 모든 날짜. 2박 3일 휴가면 사흘 전부에 표시된다.
 *
 * 상한을 두는 이유는 lib/calendar.ts 의 eventDateKeys 와 같다. 종료일을
 * 잘못 적어도 달력이 멈추지 않게 한다.
 */
export function leaveDateKeys(leave: Leave): DateKey[] {
  const start = leave.started_on;
  if (!leave.ended_on || leave.ended_on <= start) return [start];

  const end = parseDateKey(leave.ended_on);
  const cursor = parseDateKey(start);
  const keys: DateKey[] = [];

  while (cursor <= end && keys.length < 366) {
    keys.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return keys;
}

/**
 * 날짜별로 어떤 일정이 걸쳐 있는지.
 *
 * 하루에 둘이 겹치면 뒤에 오는 것이 이긴다. 목록이 최신순이라 최근에 적은
 * 쪽이 남는데, 겹치는 일이 드물고 겹쳤다면 나중에 적은 게 맞을 때가 많다.
 */
export function buildLeaveIndex(leaves: Leave[]): Map<DateKey, Leave> {
  const index = new Map<DateKey, Leave>();

  for (const leave of [...leaves].reverse()) {
    for (const key of leaveDateKeys(leave)) index.set(key, leave);
  }

  return index;
}

/** 아직 안 지난 일정만, 가까운 날부터. */
export function upcomingLeaves(leaves: Leave[], today: DateKey): Leave[] {
  return leaves
    .filter((leave) => (leave.ended_on || leave.started_on) >= today)
    .sort((a, b) => a.started_on.localeCompare(b.started_on));
}
