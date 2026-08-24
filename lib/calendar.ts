import { CalendarEvent, Post } from './types';

/** 'YYYY-MM-DD' 형태의 날짜 키. 타임존 이동 없이 '그 날짜'만 다루기 위한 값이에요. */
export type DateKey = string;

export function toDateKey(date: Date): DateKey {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** new Date('2026-08-19')는 UTC 자정으로 해석돼 하루씩 밀릴 수 있어서 직접 파싱해요. */
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

/** 여러 날에 걸친 일정은 걸쳐 있는 모든 날짜에 표시돼요. */
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

export function postDateKey(post: Post): DateKey {
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
