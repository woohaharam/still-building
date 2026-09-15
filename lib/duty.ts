import { DateKey, parseDateKey } from './calendar';
import { DUTY_SLOTS, Duty, DutySlot } from './types';

/**
 * 근무표 계산.
 *
 * lib/duties.ts 는 Supabase 클라이언트를 불러오는데, 그 클라이언트는 import
 * 만 해도 환경변수를 요구해서 키가 없는 곳(테스트)에서는 터진다. 그래서
 * 순수한 부분만 갈라뒀다 (lib/leave-dates.ts 와 같은 이유).
 */

/**
 * 타임별 시각.
 *
 * 삼팔이 03-08 인 건 확실하고, 나머지는 다섯 타임이 하루를 빈틈없이 메운다는
 * 데서 맞췄다. 규정이 다르면 이 표의 숫자만 고치면 화면 전체가 따라간다.
 *
 * nextDay 두 칸은 근무일 기준이다. 근무일은 오전(08시)에 시작해서 다음 날
 * 08시에 끝나므로, 열삼은 끝이 다음 날이고 삼팔은 시작도 끝도 다음 날이다.
 */
export const DUTY_HOURS: Record<
  DutySlot,
  {
    from: string;
    to: string;
    /** 시작이 근무일 다음 날인지. 삼팔만 그렇다. */
    startsNextDay: boolean;
    /** 끝이 근무일 다음 날인지. 열삼과 삼팔이 그렇다. */
    endsNextDay: boolean;
  }
> = {
  am: { from: '08:00', to: '13:00', startsNextDay: false, endsNextDay: false },
  pm: { from: '13:00', to: '18:00', startsNextDay: false, endsNextDay: false },
  evening: {
    from: '18:00',
    to: '23:00',
    startsNextDay: false,
    endsNextDay: false,
  },
  late: { from: '23:00', to: '03:00', startsNextDay: false, endsNextDay: true },
  dawn: { from: '03:00', to: '08:00', startsNextDay: true, endsNextDay: true },
};

/**
 * 근무일 안에서의 자리. DUTY_SLOTS 의 순서를 그대로 쓴다.
 *
 * 표를 따로 적지 않고 배열에서 만든다. 두 곳에 같은 순서를 적어두면 언젠가
 * 한쪽만 고쳐지고, 그러면 조가 조용히 어긋난다.
 */
const SLOT_ORDER: Record<string, number> = Object.fromEntries(
  DUTY_SLOTS.map((slot, index) => [slot, index])
);

/** 한 근무일에 들어가는 타임 수. 조를 이 단위로 센다. */
const SLOTS_PER_DAY = DUTY_SLOTS.length;

/** 하루를 밀리초로. 날짜만 다루므로 UTC 로 재서 시간대에 안 흔들리게 한다. */
const DAY = 86_400_000;

/** 근무를 가리키는 데 필요한 최소한. 저장 전의 폼 값도 이 모양이면 된다. */
export type DutyLike = Pick<Duty, 'served_on' | 'slot'>;

/** DB 에서 온 문자열이 아는 타임인지. */
export function isDutySlot(value: string): value is DutySlot {
  return Object.prototype.hasOwnProperty.call(SLOT_ORDER, value);
}

function utcDays(key: DateKey): number {
  const date = parseDateKey(key);
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY;
}

/**
 * 근무 하나를 번호 하나로. 조 계산의 바탕이다.
 *
 * 입대 이래의 모든 타임에 빠짐없이 번호를 매겨둔 것과 같다. 두 근무의 번호
 * 차이가 그대로 몇 조인지가 된다.
 *
 * 날짜 문자열을 직접 쪼개서 UTC 로 잰다. new Date('2026-09-17') 은 UTC 자정으로
 * 읽혀서 시간대에 따라 하루씩 밀린다 (lib/service.ts 와 같은 이유).
 */
export function slotNumber(duty: DutyLike): number {
  return utcDays(duty.served_on) * SLOTS_PER_DAY + SLOT_ORDER[duty.slot];
}

/**
 * 앞 근무에서 뒤 근무까지 몇 조인지.
 *
 * 오후 다음 날 오전이면 4조, 석간 다음 날 오후도 4조, 오후 다음 날 열삼이면
 * 7조. 타임 번호의 차이가 그대로 조다.
 *
 * 순서가 뒤집혀 있으면 null. 조는 '다음에 언제 다시 들어갔나'를 세는 말이라
 * 거꾸로는 뜻이 없다.
 */
export function joBetween(prev: DutyLike, next: DutyLike): number | null {
  const gap = slotNumber(next) - slotNumber(prev);
  return gap > 0 ? gap : null;
}

export interface DutyRow {
  duty: Duty;
  /** 직전 근무에서 몇 조 만에 다시 들어왔는지. 맨 처음 근무는 null. */
  jo: number | null;
  /** 노딱 — 한 근무일에 두 번 들어간 날. 오전과 삼팔이 같이 오는 그 날이다. */
  yellow: boolean;
}

/**
 * 근무 목록을 명세서 한 장으로. 최근 것이 먼저 온다.
 *
 * 조는 직전 근무와의 차이라서 시간순으로 세워야 나온다. 그래서 먼저 정렬해
 * 계산하고, 내보낼 때 뒤집는다.
 *
 * 모르는 타임이 섞여 있으면 버린다. 번호를 못 매기는 행을 끼워두면 그 뒤의
 * 조가 전부 어긋난다. 한 줄이 빠지는 편이 낫다.
 */
export function buildDutySheet(duties: Duty[]): DutyRow[] {
  const sorted = duties
    .filter((duty) => isDutySlot(duty.slot))
    .sort((a, b) => slotNumber(a) - slotNumber(b));

  const perDay = new Map<DateKey, number>();
  for (const duty of sorted) {
    perDay.set(duty.served_on, (perDay.get(duty.served_on) ?? 0) + 1);
  }

  const rows = sorted.map((duty, index) => {
    const prev = sorted[index - 1];
    return {
      duty,
      jo: prev ? joBetween(prev, duty) : null,
      yellow: (perDay.get(duty.served_on) ?? 0) > 1,
    };
  });

  return rows.reverse();
}

export interface DutyMonth {
  /** 'YYYY-MM'. 화면에서는 formatMonthLabel 로 적는다. */
  month: string;
  rows: DutyRow[];
}

/** 명세서를 달 단위로 자른다. 순서는 받은 그대로, 곧 최근 달이 먼저다. */
export function groupDutiesByMonth(rows: DutyRow[]): DutyMonth[] {
  const months: DutyMonth[] = [];

  for (const row of rows) {
    const month = row.duty.served_on.slice(0, 7);
    const last = months[months.length - 1];

    if (last && last.month === month) last.rows.push(row);
    else months.push({ month, rows: [row] });
  }

  return months;
}

export interface DutyTally {
  /** 총 근무 횟수. 날 수가 아니라 타임 수다 — 노딱인 날은 두 번 센다. */
  total: number;
  bySlot: Record<DutySlot, number>;
  /** 노딱을 먹은 날 수. 이쪽은 날 수다. */
  yellowDays: number;
  /** 명근을 먹은 횟수. */
  dayOffAfter: number;
}

/**
 * 명세서 요약.
 *
 * 평균 조는 내지 않는다. 휴가로 한참 빈 자리까지 같이 평균 내면 '보통 몇 조로
 * 도는지'와는 전혀 다른 숫자가 나온다. 없는 편이 낫다.
 */
export function tallyDuties(rows: DutyRow[]): DutyTally {
  const bySlot = Object.fromEntries(
    DUTY_SLOTS.map((slot) => [slot, 0])
  ) as Record<DutySlot, number>;

  const yellowDays = new Set<DateKey>();
  let dayOffAfter = 0;

  for (const row of rows) {
    bySlot[row.duty.slot] += 1;
    if (row.yellow) yellowDays.add(row.duty.served_on);
    if (row.duty.day_off_after) dayOffAfter += 1;
  }

  return {
    total: rows.length,
    bySlot,
    yellowDays: yellowDays.size,
    dayOffAfter,
  };
}

/** '08:00 — 13:00'. */
export function dutyTimeLabel(slot: DutySlot): string {
  const hours = DUTY_HOURS[slot];
  return `${hours.from} — ${hours.to}`;
}

/** 자정을 넘겨 뛰는 타임인지. 열삼과 삼팔이 그렇다. */
export function crossesMidnight(slot: DutySlot): boolean {
  return DUTY_HOURS[slot].endsNextDay;
}
