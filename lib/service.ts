import { DateKey, parseDateKey, seoulDateKey } from './calendar';
import { LeaveKind } from './types';

/**
 * 복무 기간. 날짜가 바뀌면 이 두 줄만 고치면 화면 전체가 따라간다.
 */
export const SERVICE = {
  branch: '공군',
  enlistedOn: '2025-07-28' as DateKey,
  dischargeOn: '2027-04-27' as DateKey,
};

/**
 * 규정상의 출영·복귀 시각.
 *
 * null 은 그쪽을 따지지 않는다는 뜻이다. 출영이 null 이면 그날은 처음부터,
 * 복귀가 null 이면 그날은 끝까지 나가 있는 것으로 본다.
 *
 * 여기 적힌 건 기본값이다. 특별외출처럼 받을 때마다 시각이 달라지는 건
 * 일정마다 따로 적을 수 있고(left_at · returned_at), 적어두면 그쪽이 이긴다.
 * 규정이 바뀌면 이 표의 숫자만 고치면 화면 전체가 따라간다.
 */
export const LEAVE_SCHEDULE: Record<
  LeaveKind,
  { leftAt: string | null; returnedAt: string | null }
> = {
  outing: { leftAt: '13:30', returnedAt: '21:30' },
  // 받을 때마다 다르다. 일정마다 적는 걸 전제로 한 기본값이다.
  special_outing: { leftAt: '08:00', returnedAt: '20:00' },
  // 외박 시각은 아직 못 들었다. 평일외출과 같게 뒀다.
  overnight: { leftAt: '13:30', returnedAt: '21:30' },
  // 휴가 출영은 나가는 날이 평일이냐 주말이냐로 갈린다. WEEKEND_LEAVE_AT 참고.
  leave: { leftAt: '06:30', returnedAt: '21:30' },
  // 말출은 나가면 전역까지 돌아오지 않는다.
  final: { leftAt: '13:30', returnedAt: null },
  // OFF 는 나가는 게 아니라 하루가 통째로 그 상태다.
  off: { leftAt: null, returnedAt: null },
};

/** 주말에 나가는 휴가의 출영 시각. 평일보다 삼십 분 늦다. */
export const WEEKEND_LEAVE_AT = '07:00';

/**
 * 'HH:MM' 또는 'HH:MM:SS' → 자정에서 몇 분. 모양이 어긋나면 null.
 *
 * 초까지 받는 건 Postgres 의 time 이 '13:30:00' 으로 오기 때문이다. 초는 버린다.
 */
export function parseClock(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;

  return hour * 60 + minute;
}

/** 자정에서 몇 분 → 'HH:MM'. parseClock 의 반대. */
export function formatClock(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * 그 종류의 기본 시각.
 *
 * kind 는 DB 에서 온 문자열이다. 대괄호로 바로 꺼내면 프로토타입에 있는 이름이
 * 값인 척 딸려 나오므로, 아는 종류인지 먼저 확인한다.
 */
export function defaultSchedule(kind: LeaveKind) {
  return Object.prototype.hasOwnProperty.call(LEAVE_SCHEDULE, kind)
    ? LEAVE_SCHEDULE[kind]
    : { leftAt: null, returnedAt: null };
}

export interface ServiceStatus {
  /** 입대일부터 전역일까지, 양 끝을 포함한 날 수. */
  totalDays: number;
  /** 오늘까지 지낸 날. 입대 전이면 0. */
  servedDays: number;
  /** 전역까지 남은 날. 전역일 당일이면 0. */
  daysLeft: number;
  /** 0~100. 화면에 막대로 그린다. */
  percent: number;
  /** 전역일 당일이거나 지났는지. */
  discharged: boolean;
  /** 전역일 당일인지. 남은 날이 0 인 것만으로는 지난 날과 구분되지 않는다. */
  isDischargeDay: boolean;
}

/** 하루를 밀리초로. 날짜만 다루므로 UTC 로 재서 시간대에 안 흔들리게 한다. */
const DAY = 86_400_000;

function utcDays(key: DateKey): number {
  const date = parseDateKey(key);
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY;
}

/**
 * 오늘 기준 복무 현황.
 *
 * 날짜 문자열을 직접 쪼개서 UTC 로 잰다. new Date('2026-09-03') 은 UTC 자정으로
 * 읽혀서 시간대에 따라 하루씩 밀린다 (lib/calendar.ts 와 같은 이유).
 */
export function serviceStatus(
  today: DateKey = seoulDateKey(),
  enlistedOn: DateKey = SERVICE.enlistedOn,
  dischargeOn: DateKey = SERVICE.dischargeOn
): ServiceStatus {
  const start = utcDays(enlistedOn);
  const end = utcDays(dischargeOn);
  const now = utcDays(today);

  // 전역일이 입대일보다 빠르면 셀 수 있는 게 없다. 화면이 음수를 그리지 않게 막는다.
  const totalDays = Math.max(1, end - start + 1);

  const servedDays = clamp(now - start + 1, 0, totalDays);
  const daysLeft = Math.max(0, end - now);
  const percent = clamp((servedDays / totalDays) * 100, 0, 100);

  return {
    totalDays,
    servedDays,
    daysLeft,
    percent,
    discharged: now >= end,
    isDischargeDay: now === end,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** 'D-236', 전역일 당일은 'D-DAY', 지났으면 '전역'. */
export function dDayLabel(status: ServiceStatus): string {
  if (status.isDischargeDay) return 'D-DAY';
  if (status.discharged) return '전역';
  return `D-${status.daysLeft}`;
}

/**
 * 나가 있는 동안 뭐라고 부를지.
 *
 * 종류 이름(평일외출·특별외출)과 상태 이름(외출 중)은 다르다. 평일이든
 * 특별이든 지금 밖에 있다는 사실은 같아서, 헤더에는 둘을 같은 말로 적는다.
 */
const STANDING_LABELS: Record<LeaveKind, string> = {
  outing: '외출 중',
  special_outing: '외출 중',
  overnight: '외박 중',
  leave: '휴가 중',
  final: '말출',
  off: 'OFF',
};

export interface ServiceStanding {
  label: string;
  /** 전역했을 때만 붙는다. 글자를 읽기 전에 알아보라고 둔 것이다. */
  emoji: string;
  /** 강조해서 그릴지. 전역만 참이다. */
  strong: boolean;
}

/**
 * 오늘 상태 한 마디.
 *
 * 전역 여부는 날짜만으로 정해지므로 서버에서 그대로 그릴 수 있다. 나가 있는
 * 중인지는 DB 를 봐야 알아서, 모르면 kind 를 비워두고 '복무 중'으로 둔다.
 * 화면이 비는 것보다 덜 자세한 쪽이 낫다.
 */
export function serviceStanding(
  status: ServiceStatus,
  kind: LeaveKind | null = null
): ServiceStanding {
  if (status.discharged) return { label: '전역', emoji: '🎖️', strong: true };
  if (status.servedDays === 0) {
    return { label: '입대 전', emoji: '', strong: false };
  }

  // kind 는 DB 에서 온 문자열이다. 대괄호로 바로 꺼내면 프로토타입에 있는
  // 이름(constructor 같은 것)이 값인 척 딸려 나온다.
  const known =
    kind !== null &&
    Object.prototype.hasOwnProperty.call(STANDING_LABELS, kind);

  return {
    label: known ? STANDING_LABELS[kind] : '복무 중',
    emoji: '',
    strong: false,
  };
}
