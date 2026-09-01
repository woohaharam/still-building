import { cache } from 'react';
import { supabaseClient } from './supabase';
import { Trip } from './types';

/**
 * 발행한 여행만. 실패하면 빈 배열 대신 던진다.
 * 조용히 넘어가면 "아직 없어요"가 떠서, 안 쓴 건지 서버가 죽은 건지
 * 구분할 수가 없다 (lib/posts.ts 와 같은 이유).
 */
export const getPublishedTrips = cache(
  async function getPublishedTrips(): Promise<Trip[]> {
    const { data, error } = await supabaseClient
      .from('trips')
      .select('*')
      .eq('published', true)
      .order('started_on', { ascending: false });

    if (error) {
      throw new Error(`여행 기록을 불러오지 못했어요: ${error.message}`);
    }

    return data as Trip[];
  }
);

/** 없는 slug 와 조회 실패를 구분한다. maybeSingle 은 0건일 때 null 을 준다. */
export const getTripBySlug = cache(async function getTripBySlug(
  slug: string
): Promise<Trip | null> {
  const { data, error } = await supabaseClient
    .from('trips')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error) {
    throw new Error(`여행 기록을 불러오지 못했어요: ${error.message}`);
  }

  return (data as Trip) ?? null;
});
