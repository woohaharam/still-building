import { cache } from 'react';
import { supabaseClient } from './supabase';
import { Post } from './types';

export async function getPublishedPosts(): Promise<Post[]> {
  const { data, error } = await supabaseClient
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch posts:', error.message);
    return [];
  }

  return data as Post[];
}

/** 한 요청 안에서 여러 번 불러도 DB에는 한 번만 물어봐요 (본문 + 메타데이터 + 미리보기 이미지). */
export const getPostBySlug = cache(async function getPostBySlug(
  slug: string
): Promise<Post | null> {
  const { data, error } = await supabaseClient
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) {
    console.error('Failed to fetch post:', error.message);
    return null;
  }

  return data as Post;
});

export async function getFirstPostDate(): Promise<string | null> {
  const { data, error } = await supabaseClient
    .from('posts')
    .select('published_at')
    .eq('published', true)
    .order('published_at', { ascending: true })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data.published_at;
}
