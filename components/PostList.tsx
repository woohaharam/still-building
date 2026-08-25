'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Post } from '@/lib/types';
import PostRow from './PostRow';

export default function PostList({
  posts,
  emptyLabel = '이 카테고리',
}: {
  posts: Post[];
  emptyLabel?: string;
}) {
  const [query, setQuery] = useState('');

  // 제목·요약·본문을 통째로 훑는다. 글이 아주 많아지면 그때 서버 검색으로 옮기면 된다.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) =>
      `${p.title} ${p.excerpt || ''} ${p.content}`.toLowerCase().includes(q)
    );
  }, [posts, query]);

  function emptyMessage() {
    if (posts.length === 0)
      return '아직 작성된 글이 없어요. 첫 글을 기다리고 있어요.';
    if (query.trim()) return `'${query.trim()}'와 맞는 글을 찾지 못했어요.`;
    return `${emptyLabel}에 해당하는 글이 아직 없어요.`;
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

      {filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-ink-muted">
          {emptyMessage()}
        </p>
      )}

      <ul className="flex flex-col">
        {filtered.map((post) => (
          <li key={post.id} className="border-b border-line py-6 first:pt-0">
            <Link
              href={`/posts/${post.slug}`}
              className="group flex items-start gap-4"
            >
              <PostRow post={post} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
