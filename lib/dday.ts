import { DateKey, dayNumber, seoulDateKey } from './calendar';
import { CalendarEvent } from './types';

/**
 * 남은 날 세기.
 *
 * 전역까지 남은 날(lib/service.ts)과 계산은 같지만 쓰임이 다르다. 그쪽은
 * 하나뿐인 날짜라 진행률까지 같이 내고, 이쪽은 여러 일정을 줄 세운다.
 *
 * lib/events.ts 와 갈라둔 이유는 lib/leave-dates.ts 와 같다. 순수 함수를
 * Supabase 클라이언트 옆에 두면 테스트가 환경변수 없이 터진다.
 */

/** 오늘부터 그날까지 며칠. 오늘이면 0, 지난 날이면 음수. */
export function daysUntil(
  target: DateKey,
  today: DateKey = seoulDateKey()
): number {
  return dayNumber(target) - dayNumber(today);
}

/**
 * 'D-14' · 'D-DAY' · 'D+3'.
 *
 * 지난 날을 D+ 로 적는 건 한국에서 쓰는 방식 그대로다. 입대 D+417 처럼
 * 지나온 날을 셀 때 쓴다.
 */
export function ddayLabel(days: number): string {
  if (days === 0) return 'D-DAY';
  return days > 0 ? `D-${days}` : `D+${-days}`;
}

/**
 * 메인에 띄울 일정 하나.
 *
 * ongoing 은 여러 날짜에 걸친 일정이 지금 그 안에 있는 경우다. 시작일은
 * 지났으니 남은 날이 음수인데, 그걸 'D+2' 로 적으면 끝난 일처럼 보인다.
 */
export interface Countdown {
  event: CalendarEvent;
  /** 시작일까지 남은 날. 진행 중이면 음수다. */
  days: number;
  ongoing: boolean;
}

/**
 * 메인에 띄울 일정을, 가까운 날부터.
 *
 * 띄우기로 표시한 것(pinned) 중에서 아직 안 지난 것만 고른다. 며칠에 걸친
 * 일정은 마지막 날까지 남는다 — 시험 기간 이틀째에 목록에서 사라지면,
 * 남은 날을 세라고 올려둔 것이 정작 그날 없어진다.
 */
export function upcomingCountdowns(
  events: CalendarEvent[],
  today: DateKey = seoulDateKey(),
  limit = 3
): Countdown[] {
  const countdowns: Countdown[] = [];

  for (const event of events) {
    if (!event.pinned) continue;

    const until = daysUntil(event.start_date, today);
    const last = event.end_date || event.start_date;

    if (until >= 0) {
      countdowns.push({ event, days: until, ongoing: false });
    } else if (daysUntil(last, today) >= 0) {
      countdowns.push({ event, days: until, ongoing: true });
    }
  }

  // 진행 중인 것이 먼저 온다. 남은 날이 음수라 그냥 정렬해도 위로 올라간다.
  return countdowns.sort((a, b) => a.days - b.days).slice(0, limit);
}

/**
 * 코앞인지. 글자를 진하게 쓸지 정하는 데 쓴다.
 *
 * 일주일로 잡은 건 한 주가 사람이 일정을 실제로 조정하는 단위라서다. 그
 * 안으로 들어오면 미루거나 바꿀 여지가 없다.
 */
export const SOON_DAYS = 7;

export function isSoon(countdown: Countdown): boolean {
  return countdown.ongoing || countdown.days <= SOON_DAYS;
}
