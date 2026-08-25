import { cache } from 'react';
import { supabaseClient } from './supabase';
import { DIARY_TAG, Post } from './types';

/**
 * 예약 발행 — published가 켜져 있어도 발행 시각이 안 지났으면 감춘다.
 *
 * published_at이 비어 있는 옛 글까지 걸러지면 안 되니까 or로 묶는다.
 * 이 검사는 화면 쪽 편의고, 진짜 차단은 DB 정책이 합니다
 * (supabase-migration-schedule.sql 참고).
 */
function visibleNow() {
  return `published_at.is.null,published_at.lte.${new Date().toISOString()}`;
}

/**
 * 조회에 실패하면 빈 배열 대신 에러를 던진다.
 * 조용히 넘어가면 화면에 "아직 작성된 글이 없어요"가 떠서,
 * 글이 없는 건지 서버가 죽은 건지 구분할 수가 없기 때문이다.
 *
 * cache()로 감싸서 한 요청 안에서는 DB에 한 번만 물어봅니다.
 */
export const getPublishedPosts = cache(
  async function getPublishedPosts(): Promise<Post[]> {
    const { data, error } = await supabaseClient
      .from('posts')
      .select('*')
      .eq('published', true)
      .or(visibleNow())
      .order('published_at', { ascending: false });

    if (error) {
      throw new Error(`글 목록을 불러오지 못했어요: ${error.message}`);
    }

    // 정책에서도 빼두지만, 마이그레이션 전이라도 새어나가지 않게 한 번 더 거른다.
    return (data as Post[]).filter((post) => !post.tags?.includes(DIARY_TAG));
  }
);

export const getPostBySlug = cache(async function getPostBySlug(
  slug: string
): Promise<Post | null> {
  // maybeSingle()은 결과가 없을 때 에러 대신 null을 준다.
  // 그래야 '없는 글(404)'과 '조회 실패(500)'를 구분할 수 있다.
  const { data, error } = await supabaseClient
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .or(visibleNow())
    .maybeSingle();

  if (error) {
    throw new Error(`글을 불러오지 못했어요: ${error.message}`);
  }

  const post = (data as Post) ?? null;

  // 일기는 비밀번호를 통과한 뒤 /blog/diary 안에서만 읽는다.
  // 주소만 알면 열리면 비밀번호가 아무 의미가 없다.
  if (post?.tags?.includes(DIARY_TAG)) return null;

  return post;
});

/** 글 아래에 붙는 이전/다음 글. 목록이 최신순이라 배열 뒤쪽이 더 옛날 글이에요. */
export async function getAdjacentPosts(slug: string): Promise<{
  older: Post | null;
  newer: Post | null;
}> {
  const posts = await getPublishedPosts();
  const index = posts.findIndex((post) => post.slug === slug);

  if (index === -1) return { older: null, newer: null };

  return {
    older: posts[index + 1] ?? null,
    newer: posts[index - 1] ?? null,
  };
}
