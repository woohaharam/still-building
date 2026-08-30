import { cache } from 'react';
import { supabaseClient } from './supabase';
import { Book } from './types';

/**
 * 발행한 독후감만. 실패하면 빈 배열 대신 던진다.
 * 조용히 넘어가면 화면에 "아직 없어요"가 떠서, 안 쓴 건지 서버가 죽은 건지
 * 구분할 수가 없다 (lib/posts.ts 와 같은 이유).
 *
 * cache() 로 감싸서 한 요청 안에서는 DB 에 한 번만 물어본다.
 */
export const getPublishedBooks = cache(
  async function getPublishedBooks(): Promise<Book[]> {
    const { data, error } = await supabaseClient
      .from('books')
      .select('*')
      .eq('published', true)
      .order('finished_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`독후감을 불러오지 못했어요: ${error.message}`);
    }

    return data as Book[];
  }
);

/**
 * 없는 slug 와 조회 실패를 구분한다.
 * maybeSingle() 은 0건일 때 에러 대신 null 을 주므로, 에러가 오면 진짜 장애다.
 */
export const getBookBySlug = cache(async function getBookBySlug(
  slug: string
): Promise<Book | null> {
  const { data, error } = await supabaseClient
    .from('books')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error) {
    throw new Error(`독후감을 불러오지 못했어요: ${error.message}`);
  }

  return (data as Book) ?? null;
});
