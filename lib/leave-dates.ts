import { DateKey, parseDateKey, toDateKey } from './calendar';
import {
  WEEKEND_LEAVE_AT,
  defaultSchedule,
  formatClock,
  parseClock,
} from './service';
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

/**
 * 그날 걸쳐 있는 일정. 없으면 null.
 *
 * 겹칠 때의 규칙은 buildLeaveIndex 와 같다. 목록이 최신순으로 오므로 앞에서
 * 먼저 걸리는 쪽, 곧 나중에 적은 쪽이 이긴다.
 */
export function leaveOn(leaves: Leave[], key: DateKey): Leave | null {
  for (const leave of leaves) {
    const end = leave.ended_on || leave.started_on;
    if (leave.started_on <= key && end >= key) return leave;
  }

  return null;
}

/** 그 일정이 실제로 밖에 있는 시간대. 자정에서 몇 분인지로. */
export interface LeaveWindow {
  /** 나가는 날의 출영 시각. null 이면 그날 처음부터 나가 있다. */
  leftAt: number | null;
  /** 복귀하는 날의 복귀 시각. null 이면 그날 끝까지 나가 있다. */
  returnedAt: number | null;
}

/** 토요일과 일요일. */
function isWeekend(key: DateKey): boolean {
  const day = parseDateKey(key).getDay();
  return day === 0 || day === 6;
}

/**
 * 그 일정의 출영·복귀 시각.
 *
 * 적어둔 값이 있으면 그게 이기고, 없으면 종류별 규정값을 쓴다. 휴가만 예외로
 * 나가는 날이 주말이면 출영이 삼십 분 늦다.
 */
export function leaveWindow(leave: Leave): LeaveWindow {
  const fallback = defaultSchedule(leave.kind);

  const defaultLeftAt =
    leave.kind === 'leave' && isWeekend(leave.started_on)
      ? WEEKEND_LEAVE_AT
      : fallback.leftAt;

  return {
    leftAt: resolve(leave.left_at, defaultLeftAt),
    returnedAt: resolve(leave.returned_at, fallback.returnedAt),
  };
}

/** 적어둔 값 → 규정값 순으로 읽는다. 둘 다 없거나 모양이 어긋나면 null. */
function resolve(written: string | null, fallback: string | null) {
  if (written !== null) {
    const at = parseClock(written);
    if (at !== null) return at;
  }

  return fallback === null ? null : parseClock(fallback);
}

/**
 * 지금 나가 있는 일정. 출영·복귀 시각까지 본다.
 *
 * leaveOn 은 날짜만 본다. 달력 칸을 칠할 때는 그게 맞다. 나가는 날도 복귀하는
 * 날도 그날의 일정이니까 색은 남아야 한다. 반면 헤더의 '외출 중'은 지금 밖에
 * 있느냐를 묻는 말이라, 출영 전과 복귀 뒤로는 꺼져야 한다.
 *
 * 아닌 일정은 건너뛰고 계속 찾는다. 아직 안 나간 일정이나 이미 들어온 일정
 * 때문에 같은 날 잡힌 다른 일정까지 가려지면 안 된다.
 */
export function leaveNow(
  leaves: Leave[],
  key: DateKey,
  minutes: number
): Leave | null {
  for (const leave of leaves) {
    const end = leave.ended_on || leave.started_on;
    if (leave.started_on > key || end < key) continue;

    const { leftAt, returnedAt } = leaveWindow(leave);

    // 나가는 날에만 출영 시각을 따진다. 그 뒤의 날들은 이미 밖이다.
    if (key === leave.started_on && leftAt !== null && minutes < leftAt) {
      continue;
    }

    // 복귀하는 날에만 복귀 시각을 따진다. 그전 날들은 아직 밖이다.
    if (key === end && returnedAt !== null && minutes >= returnedAt) {
      continue;
    }

    return leave;
  }

  return null;
}

/**
 * '13:30 — 21:30'. 한쪽이 없으면 있는 쪽만, 둘 다 없으면 빈 문자열.
 *
 * 말출처럼 돌아오지 않는 일정은 '13:30 나감'으로 끝난다.
 */
export function leaveTimeLabel(leave: Leave): string {
  const { leftAt, returnedAt } = leaveWindow(leave);

  if (leftAt !== null && returnedAt !== null) {
    return `${formatClock(leftAt)} — ${formatClock(returnedAt)}`;
  }
  if (leftAt !== null) return `${formatClock(leftAt)} 나감`;
  if (returnedAt !== null) return `${formatClock(returnedAt)} 복귀`;

  return '';
}
