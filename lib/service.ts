import { DateKey, parseDateKey, toDateKey } from './calendar';

/**
 * 복무 기간.
 *
 * 전역일과 D-day 는 군돌이 화면과 맞춰봤고, 진행률을 역산해서 입대일을 냈다.
 * 날짜가 다르면 이 두 줄만 고치면 화면 전체가 따라간다.
 */
export const SERVICE = {
  branch: '공군',
  enlistedOn: '2025-07-27' as DateKey,
  dischargeOn: '2027-04-27' as DateKey,
};

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
  today: DateKey = toDateKey(new Date()),
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
