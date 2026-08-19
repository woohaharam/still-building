'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { readingMinutes } from '@/lib/reading';
import { Post, PostTag, TAG_LABELS } from '@/lib/types';
import TagFilter from './TagFilter';

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function PostList({ posts }: { posts: Post[] }) {
  const [activeTag, setActiveTag] = useState<PostTag | 'all'>('all');
  const [query, setQuery] = useState('');

  // 제목·요약·본문을 통째로 훑어요. 글이 아주 많아지면 그때 서버 검색으로 옮기면 돼요.
  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) =>
      `${p.title} ${p.excerpt || ''} ${p.content}`.toLowerCase().includes(q)
    );
  }, [posts, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: searched.length,
      tech: 0,
      life: 0,
      retrospective: 0,
    };
    searched.forEach((p) => p.tags?.forEach((t) => (c[t] = (c[t] || 0) + 1)));
    return c;
  }, [searched]);

  const filtered = useMemo(() => {
    if (activeTag === 'all') return searched;
    return searched.filter((p) => p.tags?.includes(activeTag));
  }, [searched, activeTag]);

  function emptyMessage() {
    if (posts.length === 0) return '아직 작성된 글이 없어요. 첫 글을 기다리고 있어요.';
    if (query.trim()) return `'${query.trim()}'와 맞는 글을 찾지 못했어요.`;
    return '이 태그에 해당하는 글이 아직 없어요.';
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="글 검색"
          aria-label="글 검색"
          className="w-full rounded-md border border-line bg-transparent px-3 py-2 pr-16 text-sm focus:border-ink-muted focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted hover:text-ink-soft"
          >
            지우기
          </button>
        )}
      </div>

      <TagFilter active={activeTag} onChange={setActiveTag} counts={counts} />

      {filtered.length === 0 && (
        <p className="text-ink-muted text-sm py-12 text-center">{emptyMessage()}</p>
      )}

      <ul className="flex flex-col">
        {filtered.map((post) => (
          <li key={post.id} className="border-b border-line py-6 first:pt-0">
            <Link href={`/posts/${post.slug}`} className="group block">
              <h2 className="text-lg font-semibold group-hover:text-accent transition-colors">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mt-2 text-ink-soft text-sm leading-relaxed">
                  {post.excerpt}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                <span>{formatDate(post.published_at)}</span>
                <span>읽는 데 {readingMinutes(post.content)}분</span>
                {post.tags?.map((t) => (
                  <span key={t}>#{TAG_LABELS[t]}</span>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
