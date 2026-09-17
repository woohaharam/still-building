export type PostTag = 'tech' | 'life' | 'retrospective' | 'diary';

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: PostTag[];
  cover_image_url: string | null;
  view_count: number;
  share_count: number;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

export const TAG_LABELS: Record<PostTag, string> = {
  tech: '개발',
  life: '일상',
  retrospective: '회고',
  diary: '일기',
};

/** 카테고리별 페이지(/blog/개발 …)에서 쓰는 설명. */
export const TAG_DESCRIPTIONS: Record<PostTag, string> = {
  tech: '만들면서 막힌 것과 푼 방법. 이 블로그의 본체.',
  life: '개발 사이사이의 하루와 생각.',
  retrospective: '끝내고 나서 돌아본 것들.',
  diary: '비밀번호를 아는 사람만 볼 수 있는 기록.',
};

/** 주소에 쓰는 이름. 한글 slug는 인코딩이 지저분해져서 영문으로 둔다. */
export const TAG_SLUGS: Record<PostTag, string> = {
  tech: 'dev',
  life: 'life',
  retrospective: 'retrospective',
  diary: 'diary',
};

/** 공개 카테고리. 일기는 잠겨 있어서 여기 넣지 않는다. */
export const POST_TAGS: PostTag[] = ['tech', 'life', 'retrospective'];

/** 관리자에서 글에 붙일 수 있는 전체 목록. */
export const ALL_POST_TAGS: PostTag[] = [...POST_TAGS, 'diary'];

export const DIARY_TAG: PostTag = 'diary';

export function tagFromSlug(slug: string): PostTag | null {
  return POST_TAGS.find((tag) => TAG_SLUGS[tag] === slug) ?? null;
}

/**
 * tags 는 DB 에서 자유 문자열 배열로 들어온다. 아는 태그가 아니면 null 을 낸다.
 *
 * TAG_LABELS[tag] 로 바로 꺼내면 안 된다. 프로토타입까지 훑기 때문에
 * "constructor" 같은 값에 함수가 잡히고, 그게 화면으로 넘어가면 렌더가 깨진다.
 * 옛날 글에 남은 모르는 태그는 라벨 없는 # 로 보이는 대신 그냥 빠진다.
 */
export function tagLabel(tag: string): string | null {
  return Object.prototype.hasOwnProperty.call(TAG_LABELS, tag)
    ? TAG_LABELS[tag as PostTag]
    : null;
}

/** 독후감 한 편. 책 정보와 감상을 같이 들고 있다. */
export interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  cover_image_url: string | null;
  /** 1~5. 안 매겼으면 null. */
  rating: number | null;
  review: string;
  /** 다 읽은 날. 목록 정렬 기준. */
  finished_at: string | null;
  published: boolean;
  created_at: string;
}

export const MIN_RATING = 1;
export const MAX_RATING = 5;

/** 여행 한 번. 다녀온 곳과 여행기를 같이 들고 있다. */
export interface Trip {
  id: string;
  slug: string;
  /** 도시나 지역 이름. '오사카', '제주'. */
  place: string;
  /** ISO 3166-1 alpha-2. 국기와 나라 이름을 여기서 만든다 (lib/country.ts). */
  country_code: string;
  started_on: string;
  /** 당일치기면 null. */
  ended_on: string | null;
  cover_image_url: string | null;
  /**
   * 지도에 핀을 찍을 자리. 비워두면 나라 중심점에 찍힌다 (lib/travel.ts).
   *
   * 나라 안에서 어디였는지가 중요한 국내 여행은 적어두는 편이 낫다. 관리자
   * 화면에서 지도를 눌러 고를 수 있다.
   */
  lng: number | null;
  lat: number | null;
  journal: string;
  published: boolean;
  created_at: string;
}

/**
 * 부대 밖으로 나가는 일정.
 *
 * 캘린더의 일정(events)과 섞지 않고 따로 둔다. 포트폴리오를 보러 온 사람이
 * 보는 캘린더와, 내가 언제 나가는지를 세는 표는 쓰임이 다르다.
 */
/**
 * 공모전·대외활동 지원 기록.
 *
 * 붙은 것만 적으면 몇 번 시도했는지가 사라진다. 떨어진 것도 같이 남긴다.
 */
export type ActivityOutcome = 'applied' | 'ongoing' | 'done' | 'rejected';

export interface Activity {
  id: string;
  name: string;
  /** 주최. 모르면 비워둔다. */
  organizer: string | null;
  outcome: ActivityOutcome;
  started_on: string;
  ended_on: string | null;
  note: string | null;
  published: boolean;
  created_at: string;
}

export const ACTIVITY_OUTCOMES: ActivityOutcome[] = [
  'applied',
  'ongoing',
  'done',
  'rejected',
];

export const ACTIVITY_OUTCOME_LABELS: Record<ActivityOutcome, string> = {
  applied: '결과 대기',
  ongoing: '활동 중',
  done: '활동함',
  rejected: '떨어짐',
};

/**
 * 부대 밖으로 나가는 일정.
 *
 * outing 은 원래 '외출' 하나였는데, 평일에 잠깐 나가는 것과 포상으로 받는
 * 특별외출은 성격이 달라서 갈랐다. 이미 쌓인 행을 옮기지 않으려고 기존
 * 값(outing)을 평일외출로 두고 special_outing 을 새로 붙였다.
 *
 * 외박은 뺐다. 부대에 그런 구분이 없어서 고를 일이 없는 칸이었다.
 *
 * 전역은 여기 없다. 날짜가 lib/service.ts 에 이미 있어서, 손으로 한 번 더
 * 적게 하면 둘이 어긋날 자리만 생긴다. 달력이 그 날짜를 직접 칠한다.
 */
export type LeaveKind = 'outing' | 'special_outing' | 'leave' | 'final' | 'off';

export interface Leave {
  id: string;
  kind: LeaveKind;
  started_on: string;
  /** 하루짜리면 null. */
  ended_on: string | null;
  /**
   * 그 일정만의 출영·복귀 시각. 'HH:MM' 또는 Postgres 가 주는 'HH:MM:SS'.
   *
   * 비워두면 종류별 기본값(lib/service.ts 의 LEAVE_SCHEDULE)을 쓴다. 특별외출처럼
   * 받을 때마다 시각이 달라지는 것만 적으면 된다.
   */
  left_at: string | null;
  returned_at: string | null;
  note: string | null;
  created_at: string;
}

/** 화면에 늘어놓는 순서. 짧게 나가는 것부터 길게 나가는 것 순이다. */
export const LEAVE_KINDS: LeaveKind[] = [
  'outing',
  'special_outing',
  'leave',
  'final',
  'off',
];

export const LEAVE_KIND_LABELS: Record<LeaveKind, string> = {
  outing: '평일외출',
  special_outing: '특별외출',
  leave: '휴가',
  final: '말출',
  off: 'OFF',
};

/**
 * 근무 한 타임.
 *
 * 군사경찰 크루제는 하루를 다섯 타임으로 끊는다. 다만 근무일은 자정이 아니라
 * 오전(08시)에 시작해서 다음 날 삼팔이 끝나는 08시까지다. 열삼과 삼팔은 시계로는
 * 자정을 넘겨 뛰지만 근무표에는 앞선 근무일에 적힌다.
 *
 * 그래서 한 근무일에 오전과 삼팔이 같이 오는 날이 생긴다. 그게 노딱이다.
 */
export type DutySlot = 'am' | 'pm' | 'evening' | 'late' | 'dawn';

/**
 * 근무일 안에서의 순서. 조를 이 순서로 센다 (lib/duty.ts).
 *
 * 시계 순서와 다르다. 삼팔은 03시라 하루 중 가장 이르지만, 근무일이 08시에
 * 시작하니 그 근무일의 마지막 타임이다. 이 배열 순서가 곧 조 계산의 바탕이라
 * 함부로 흔들면 안 된다.
 */
export const DUTY_SLOTS: DutySlot[] = ['am', 'pm', 'evening', 'late', 'dawn'];

export const DUTY_SLOT_LABELS: Record<DutySlot, string> = {
  am: '오전',
  pm: '오후',
  evening: '석간',
  late: '열삼',
  dawn: '삼팔',
};

export interface Duty {
  id: string;
  /**
   * 근무표에 적히는 날.
   *
   * 열삼·삼팔은 이 날짜의 자정을 넘겨 뛴다. 시계가 가리키는 날짜가 아니라
   * 근무표에 적히는 날짜를 넣는다.
   */
  served_on: string;
  slot: DutySlot;
  /**
   * 명근(명일근무투입)을 먹었는지.
   *
   * 먹으면 다음 날은 근무가 없고 그다음 날에 다시 들어간다. 9/17 삼팔에
   * 명근이면 18일은 비고 19일부터다.
   */
  day_off_after: boolean;
  note: string | null;
  created_at: string;
}

/**
 * slot 은 DB 에서 온 문자열이다. 아는 타임이 아니면 null 을 낸다.
 *
 * 대괄호로 바로 꺼내면 안 되는 이유는 tagLabel 과 같다. 프로토타입까지 훑어서
 * "constructor" 같은 값에 함수가 잡히고, 그게 화면으로 넘어가면 렌더가 깨진다.
 */
export function dutySlotLabel(slot: string): string | null {
  return Object.prototype.hasOwnProperty.call(DUTY_SLOT_LABELS, slot)
    ? DUTY_SLOT_LABELS[slot as DutySlot]
    : null;
}

/**
 * 캘린더에 올리는 일정.
 *
 * exam 은 마감과 성격이 달라서 따로 뒀다. 제출은 그날까지 내면 되지만 시험은
 * 그 시각에 그 자리에 있어야 한다. 남은 날을 세는 무게가 다르다.
 */
export type EventKind = 'plan' | 'deadline' | 'exam' | 'note';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  /** 'YYYY-MM-DD' */
  start_date: string;
  /** 'YYYY-MM-DD' — 하루짜리 일정이면 null */
  end_date: string | null;
  /** 'HH:MM' — 종일 일정이면 null */
  start_time: string | null;
  kind: EventKind;
  /**
   * 메인 화면에 남은 날로 띄울지 (lib/dday.ts).
   *
   * 종류로 가르지 않는 이유는, 무엇이 중요한지가 종류에서 나오지 않아서다.
   * 어떤 마감은 그냥 적어두는 것이고 어떤 약속은 몇 주 전부터 세게 된다.
   */
  pinned: boolean;
  created_at: string;
}

/** 관리자에서 고를 수 있는 순서. 가벼운 것부터 무거운 것 순이다. */
export const EVENT_KINDS: EventKind[] = ['plan', 'deadline', 'exam', 'note'];

export const EVENT_KIND_LABELS: Record<EventKind, string> = {
  plan: '일정',
  deadline: '마감',
  exam: '시험',
  note: '메모',
};

/**
 * kind 는 DB 에서 온 문자열이다. 아는 종류가 아니면 null 을 낸다.
 *
 * 대괄호로 바로 꺼내면 안 되는 이유는 tagLabel 과 같다.
 */
export function eventKindLabel(kind: string): string | null {
  return Object.prototype.hasOwnProperty.call(EVENT_KIND_LABELS, kind)
    ? EVENT_KIND_LABELS[kind as EventKind]
    : null;
}
