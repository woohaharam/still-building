import { cache } from 'react';
import { supabaseClient } from './supabase';
import { Post } from './types';

/**
 * 조회에 실패하면 빈 배열을 돌려주는 대신 에러를 던져요.
 * 조용히 넘어가면 화면에 "아직 작성된 글이 없어요"가 떠서,
 * 글이 없는 건지 서버가 죽은 건지 구분할 수가 없거든요.
 *
 * cache()로 감싸서 한 요청 안에서는 DB에 한 번만 물어봅니다.
 */
export const getPublishedPosts = cache(async function getPublishedPosts(): Promise<
  Post[]
> {
  const { data, error } = await supabaseClient
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (error) {
    throw new Error(`글 목록을 불러오지 못했어요: ${error.message}`);
  }

  return data as Post[];
});

export const getPostBySlug = cache(async function getPostBySlug(
  slug: string
): Promise<Post | null> {
  // maybeSingle()은 결과가 없을 때 에러 대신 null을 줘요.
  // 그래야 '없는 글(404)'과 '조회 실패(500)'를 구분할 수 있어요.
  const { data, error } = await supabaseClient
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error) {
    throw new Error(`글을 불러오지 못했어요: ${error.message}`);
  }

  return (data as Post) ?? null;
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
