import { CalendarEvent, Post } from './types';

/** 'YYYY-MM-DD' 형태의 날짜 키. 타임존 이동 없이 '그 날짜'만 다루기 위한 값이다. */
export type DateKey = string;

export function toDateKey(date: Date): DateKey {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 브라우저가 보는 오늘.
 *
 * 함수인 채로 useState(today) 에 넘기면 첫 그리기 때만 불린다. 서버에서
 * 그려지지 않는 화면에서 폼의 기본 날짜를 채울 때 쓴다.
 */
export function today(): DateKey {
  return toDateKey(new Date());
}

/** new Date('2026-08-19')는 UTC 자정으로 해석돼 하루씩 밀릴 수 있어서 직접 파싱한다. */
export function parseDateKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function isSameMonth(date: Date, year: number, month: number) {
  return date.getFullYear() === year && date.getMonth() === month;
}

/** 일요일 시작, 해당 월을 담는 데 필요한 만큼(5~6줄)의 날짜 배열 */
export function buildMonthMatrix(year: number, month: number): Date[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = Math.ceil((firstWeekday + daysInMonth) / 7);

  return Array.from(
    { length: weeks * 7 },
    (_, i) => new Date(year, month, 1 - firstWeekday + i)
  );
}

/** 여러 날에 걸친 일정은 걸쳐 있는 모든 날짜에 표시된다. */
export function eventDateKeys(event: CalendarEvent): DateKey[] {
  const start = event.start_date;
  if (!event.end_date || event.end_date <= start) return [start];

  const end = parseDateKey(event.end_date);
  const cursor = parseDateKey(start);
  const keys: DateKey[] = [];

  // 실수로 아주 먼 종료일을 넣어도 달력이 멈추지 않도록 상한을 둔다.
  while (cursor <= end && keys.length < 366) {
    keys.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return keys;
}

function postDateKey(post: Post): DateKey {
  return toDateKey(new Date(post.published_at || post.created_at));
}

export interface DayEntry {
  posts: Post[];
  events: CalendarEvent[];
}

export function buildDayIndex(posts: Post[], events: CalendarEvent[]) {
  const index = new Map<DateKey, DayEntry>();

  const entryFor = (key: DateKey) => {
    let entry = index.get(key);
    if (!entry) {
      entry = { posts: [], events: [] };
      index.set(key, entry);
    }
    return entry;
  };

  posts.forEach((post) => entryFor(postDateKey(post)).posts.push(post));
  events.forEach((event) =>
    eventDateKeys(event).forEach((key) => entryFor(key).events.push(event))
  );

  return index;
}

export function formatDayLabel(key: DateKey) {
  const date = parseDateKey(key);
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${weekday})`;
}

/**
 * 'YYYY-MM-DD' → 'YYYY.MM'.
 *
 * 활동·복무·이력서처럼 며칠인지보다 어느 달인지가 중요한 자리에서 쓴다.
 * 문자열을 그대로 자른다. Date 로 돌리면 시간대 때문에 달이 밀릴 수 있다.
 */
export function formatMonthLabel(key: DateKey) {
  const [year, month] = key.split('-');
  return `${year}.${month}`;
}

/**
 * 한국 기준 오늘.
 *
 * 서버는 UTC 로 돈다. new Date() 를 그대로 toDateKey 에 넣으면 한국 시간
 * 자정부터 아침 아홉 시까지는 어제 날짜가 나온다. 전역일 아침에 화면이
 * 아직 '복무 중'이라고 우기는 게 그래서다.
 *
 * 시간대 이름을 주고 en-CA 로 찍으면 'YYYY-MM-DD' 가 그대로 나온다.
 * 직접 아홉 시간을 더하는 것보다 안전하다.
 */
const SEOUL_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function seoulDateKey(now: Date = new Date()): DateKey {
  return SEOUL_DATE.format(now);
}

/**
 * 한국 기준 지금이 자정에서 몇 분 지났는지. 0 ~ 1439.
 *
 * 날짜만으로는 '복귀했는가'를 못 가른다. 외출 복귀가 저녁이면 그날 하루가
 * 통째로 외출로 남기 때문이다. hourCycle 을 h23 으로 못박아 자정이 24 로
 * 나오는 경우를 막는다.
 */
const SEOUL_TIME = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Seoul',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function seoulMinutes(now: Date = new Date()): number {
  const [hour, minute] = SEOUL_TIME.format(now).split(':').map(Number);
  return hour * 60 + minute;
}
