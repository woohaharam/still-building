import { Post } from './types';

/**
 * 일기 열기.
 *
 * 비밀번호는 이 저장소 어디에도 없다. DB 안에 해시로만 들어 있고, 대조도
 * open_diary 가 DB 안에서 한다 (supabase/02-counts-diary.sql).
 *
 * 화면에서 비밀번호를 확인하고 목록을 감추는 방식은 아무것도 못 막는다.
 * anon 키가 페이지 소스에 그대로 있어서, 누구나 Supabase 에 직접 물어보면
 * 글이 나온다. 그래서 일기는 공개 정책에서 아예 빼두고 이 길로만 꺼낸다.
 *
 * 예전에는 여기서 open_diary 를 바로 불렀다. 지금은 서버를 거친다 —
 * 반복해서 찔러보는 것을 세려면 셀 자리가 있어야 하는데, 브라우저에는
 * 그런 자리가 없다 (app/api/diary).
 */
export async function openDiary(password: string): Promise<Post[]> {
  const response = await fetch('/api/diary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || '지금은 열 수 없어요.');
  }

  return (body?.posts ?? []) as Post[];
}
