import { CalendarEvent, Post } from './types';

/*
  시각은 전부 한국 기준이다.
  ─────────────────────────
  이 사이트의 '오늘' 은 보는 사람의 오늘이 아니라 내가 사는 곳의 오늘이다.
  전역까지 남은 날도, 달력에 글이 찍히는 날도, 며칠째 만들고 있는지도
  한국에서 세는 값이다. 뉴욕에서 열어도 같은 숫자가 나와야 맞다.

  그래서 날짜를 얻는 자리는 seoulDateKey · seoulToday · seoulMinutes 셋뿐이다.
  new Date() 를 그대로 toDateKey 에 넣으면 서버(UTC)에서는 한국 시간 자정부터
  아침 아홉 시까지 어제가 나오고, 브라우저에서는 보는 사람의 시간대가 나온다.

  절대 시각을 다루는 자리는 예외다. 예약 발행이 지났는지(lib/posts.ts),
  RSS 의 최종 수정 시각(lib/feed.ts) 같은 건 시간대와 무관한 한 점이다.
*/

/** 'YYYY-MM-DD' 형태의 날짜 키. 타임존 이동 없이 '그 날짜'만 다루기 위한 값이다. */
export type DateKey = string;

export function toDateKey(date: Date): DateKey {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** new Date('2026-08-19')는 UTC 자정으로 해석돼 하루씩 밀릴 수 있어서 직접 파싱한다. */
export function parseDateKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** 하루를 밀리초로. 날짜만 다룰 때 UTC 로 재려고 둔다. */
const DAY = 86_400_000;

/**
 * 날짜를 하루 단위 번호 하나로. 두 날짜의 차이가 그대로 며칠인지가 된다.
 *
 * UTC 로 재는 건 시간대에 안 흔들리게 하려는 것이다. 서머타임이 있는 지역에서
 * 로컬 자정끼리 빼면 하루가 23시간이나 25시간이 되는 날이 나온다.
 *
 * 세 곳(복무 일수 · 근무 타임 번호 · 남은 날)이 같은 계산을 각각 들고 있었다.
 */
export function dayNumber(key: DateKey): number {
  const date = parseDateKey(key);
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY;
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

/*
  글이 올라온 날. 발행 시각은 절대 시각이라 어느 날인지는 보는 사람의
  시간대에 따라 갈린다. 한국 시간 밤 아홉 시에 올린 글은 UTC 로는 그날
  정오고, 미국 동부에서는 전날 아침이다. 달력은 내가 쓴 날을 보여주는
  것이니 한국 기준으로 센다.
*/
function postDateKey(post: Post): DateKey {
  return seoulDateKey(new Date(post.published_at || post.created_at));
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

/**
 * 요일 이름. 달력 머리글과 날짜 표기가 같은 배열을 네 곳에 각각 들고 있었다.
 *
 * getDay() 가 내는 0~6 과 자리가 맞는다 — 일요일이 0 이다.
 */
export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** 'YYYY-MM-DD' 인지. 시각이 붙은 타임스탬프와 가르는 데 쓴다. */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * '2026년 9월 22일'. 날짜만 필요한 자리에서 쓴다.
 *
 * 들어오는 값이 두 가지다. 글의 발행 시각(timestamptz)은 시각까지 붙은
 * 문자열이고, 여행·독후감·나가는 일정의 날짜(date)는 'YYYY-MM-DD' 뿐이다.
 *
 * 뒤엣것을 new Date 에 그대로 넣으면 UTC 자정으로 읽힌다. UTC 보다 뒤에 있는
 * 시간대의 브라우저에서 그리면 하루가 밀린다 — 뉴욕에서 전역일이 4월 26일로
 * 나온다. parseDateKey 가 있는 이유가 그것이고, 이 함수만 그걸 안 쓰고 있었다.
 *
 * 지금은 이 함수를 부르는 자리가 전부 서버(UTC)라서 드러나지 않는다. 한 곳이
 * 클라이언트로 옮겨가는 순간 조용히 틀리기 시작한다.
 */
export function formatDate(value: string | null): string {
  if (!value) return '';

  const date = DATE_ONLY.test(value) ? parseDateKey(value) : new Date(value);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/** '9.22 (화)'. 목록처럼 같은 해의 날짜가 줄줄이 오는 자리에서 쓴다. */
export function formatShortDay(key: DateKey) {
  const date = parseDateKey(key);
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getMonth() + 1}.${day} (${WEEKDAYS[date.getDay()]})`;
}

export function formatDayLabel(key: DateKey) {
  const date = parseDateKey(key);
  const weekday = WEEKDAYS[date.getDay()];
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
 * 한국 기준 오늘을 Date 로.
 *
 * 달력이 어느 달을 펼칠지 정할 때처럼 연·월·일을 따로 꺼내야 하는 자리에서
 * 쓴다. 돌려주는 값의 시·분은 자정으로 맞춰져 있고 뜻이 없다 — 날짜만 보라고
 * 만든 것이다.
 */
export function seoulToday(now: Date = new Date()): Date {
  return parseDateKey(seoulDateKey(now));
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
