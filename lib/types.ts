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
  tech: '만들면서 막힌 것과 푼 방법. 이 블로그의 본체예요.',
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

export type EventKind = 'plan' | 'deadline' | 'note';

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
  created_at: string;
}

export const EVENT_KIND_LABELS: Record<EventKind, string> = {
  plan: '일정',
  deadline: '마감',
  note: '메모',
};
