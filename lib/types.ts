export type PostTag = 'tech' | 'life' | 'retrospective';

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: PostTag[];
  cover_image_url: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

export const TAG_LABELS: Record<PostTag, string> = {
  tech: '개발',
  life: '일상',
  retrospective: '회고',
};

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
