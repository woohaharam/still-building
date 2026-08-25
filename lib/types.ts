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

/** 주소에 쓰는 이름. 한글 slug는 인코딩이 지저분해져서 영문으로 둡니다. */
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
