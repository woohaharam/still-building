'use client';

import { useEffect, useState } from 'react';
import PostArticle from '@/components/PostArticle';
import { supabaseClient } from '@/lib/supabase';
import { Post } from '@/lib/types';

type State = 'loading' | 'ready' | 'signed-out' | 'missing';

/**
 * 임시저장 글을 실제 글 화면 그대로 볼 수 있는 곳.
 * 브라우저에 로그인 세션이 있어야 DB가 임시저장 글을 내줘요.
 */
export default function PreviewPage({ params }: { params: { slug: string } }) {
  const [state, setState] = useState<State>('loading');
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: sessionData } = await supabaseClient.auth.getSession();
      if (cancelled) return;

      if (!sessionData.session) {
        setState('signed-out');
        return;
      }

      const { data, error } = await supabaseClient
        .from('posts')
        .select('*')
        .eq('slug', decodeURIComponent(params.slug))
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setState('missing');
        return;
      }

      setPost(data as Post);
      setState('ready');
    })();

    return () => {
      cancelled = true;
    };
  }, [params.slug]);

  if (state === 'loading') {
    return (
      <p className="py-20 text-center text-sm text-ink-muted">불러오는 중...</p>
    );
  }

  if (state === 'signed-out') {
    return (
      <p className="py-20 text-center text-sm text-ink-muted">
        로그인이 필요해요.{' '}
        <a href="/admin" className="underline">
          관리자 페이지
        </a>
        에서 로그인한 뒤 다시 열어주세요.
      </p>
    );
  }

  if (state === 'missing' || !post) {
    return (
      <p className="py-20 text-center text-sm text-ink-muted">
        그런 글을 찾지 못했어요.
      </p>
    );
  }

  return (
    <div>
      {!post.published && (
        <p className="mb-8 rounded-md border border-line bg-surface px-4 py-3 text-sm text-ink-soft">
          임시저장 상태예요. 이 화면은 로그인한 나만 볼 수 있어요.
        </p>
      )}
      <PostArticle post={post} backHref="/admin" backLabel="← 관리자로" />
    </div>
  );
}
