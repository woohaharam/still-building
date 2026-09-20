import { DateKey, dayNumber, seoulDateKey } from './calendar';
import { leaveTimeLabel } from './leave-dates';
import {
  CalendarEvent,
  eventKindLabel,
  Leave,
  LEAVE_KIND_LABELS,
} from './types';

/**
 * 남은 날 세기.
 *
 * 전역까지 남은 날(lib/service.ts)과 계산은 같지만 쓰임이 다르다. 그쪽은
 * 하나뿐인 날짜라 진행률까지 같이 내고, 이쪽은 여러 일정을 줄 세운다.
 *
 * lib/events.ts · lib/leaves.ts 와 갈라둔 이유는 lib/leave-dates.ts 와 같다.
 * 순수 함수를 Supabase 클라이언트 옆에 두면 테스트가 환경변수 없이 터진다.
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
 * 남은 날을 셀 수 있는 것 하나.
 *
 * 캘린더의 일정과 나가는 일정은 표도 칸도 다르지만, 세는 입장에서는 '언제
 * 시작해서 언제 끝나는 무엇' 일 뿐이다. 둘을 이 모양으로 바꿔서 한 줄에
 * 세운다 — 그래야 시험 D-4 와 휴가 D-2 가 가까운 순으로 섞인다.
 */
export interface Dated {
  id: string;
  /** 굵게 적히는 말. '정보처리기사 실기' · '휴가'. */
  title: string;
  /** 그 앞에 작게 붙는 갈래. '시험' · '마감' · '복무'. */
  label: string | null;
  startsOn: DateKey;
  /** 하루짜리면 null. */
  endsOn: DateKey | null;
  /** 날짜 뒤에 붙는 시각. '09:00' 이나 '06:30 — 21:30'. */
  time: string | null;
}

export interface Countdown extends Dated {
  /** 시작일까지 남은 날. 진행 중이면 음수다. */
  days: number;
  /**
   * 여러 날에 걸친 일정이 지금 그 안에 있는지.
   *
   * 시작일은 지났으니 남은 날이 음수인데, 그걸 'D+2' 로 적으면 끝난 일처럼
   * 보인다. 그래서 따로 표시해서 '진행 중' 으로 적는다.
   */
  ongoing: boolean;
}

/** 캘린더 일정 중 메인에 띄우기로 표시한 것만. */
export function fromEvents(events: CalendarEvent[]): Dated[] {
  return events
    .filter((event) => event.pinned)
    .map((event) => ({
      id: `event:${event.id}`,
      title: event.title,
      label: eventKindLabel(event.kind),
      startsOn: event.start_date,
      endsOn: event.end_date,
      time: event.start_time,
    }));
}

/**
 * 나가는 일정 전부.
 *
 * 여기엔 '띄우기' 표시가 없다. 휴가나 외출은 적어두는 것 자체가 곧 세고
 * 있다는 뜻이라, 한 번 더 고르게 할 이유가 없다.
 *
 * OFF 는 뺀다. 나가는 게 아니라 하루가 통째로 그 상태인 것이라 셀 날이 아니다.
 */
export function fromLeaves(leaves: Leave[]): Dated[] {
  return leaves
    .filter((leave) => leave.kind !== 'off')
    .map((leave) => ({
      id: `leave:${leave.id}`,
      title: LEAVE_KIND_LABELS[leave.kind],
      label: leave.note || '복무',
      startsOn: leave.started_on,
      endsOn: leave.ended_on,
      time: leaveTimeLabel(leave) || null,
    }));
}

/**
 * 메인에 띄울 것을, 가까운 날부터.
 *
 * 며칠에 걸친 것은 마지막 날까지 남는다 — 시험 기간 이틀째에 목록에서
 * 사라지면, 남은 날을 세라고 올려둔 것이 정작 그날 없어진다.
 */
export function upcomingCountdowns(
  items: Dated[],
  today: DateKey = seoulDateKey(),
  limit = 3
): Countdown[] {
  const countdowns: Countdown[] = [];

  for (const item of items) {
    const until = daysUntil(item.startsOn, today);

    if (until >= 0) {
      countdowns.push({ ...item, days: until, ongoing: false });
    } else if (daysUntil(item.endsOn || item.startsOn, today) >= 0) {
      countdowns.push({ ...item, days: until, ongoing: true });
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
