import Container from '@/components/Container';
import type { Metadata } from 'next';
import Link from 'next/link';
import PostList from '@/components/PostList';
import { getPublishedPosts } from '@/lib/posts';
import { siteUrl } from '@/lib/site';
import {
  POST_TAGS,
  TAG_DESCRIPTIONS,
  TAG_LABELS,
  TAG_SLUGS,
} from '@/lib/types';

export const revalidate = 0;

export const metadata: Metadata = {
  title: '블로그',
  description: '개발하면서 배운 것들과, 그 사이의 일상과 생각.',
  alternates: { canonical: `${siteUrl}/blog` },
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  const counts = Object.fromEntries(
    POST_TAGS.map((tag) => [
      tag,
      posts.filter((post) => post.tags?.includes(tag)).length,
    ])
  );

  return (
    <Container>
      <div>
        <section className="mb-10">
          <h1 className="text-2xl font-bold leading-snug">
            코드를 짜고, 그 사이사이의 하루를 기록합니다.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            개발 글이 본체고, 나머지는 그 사이의 기록이에요. 카테고리를 누르면
            그것만 모아 볼 수 있어요.
          </p>
        </section>

        <nav aria-label="카테고리" className="mb-12 flex flex-col">
          {POST_TAGS.map((tag) => (
            <Link
              key={tag}
              href={`/blog/${TAG_SLUGS[tag]}`}
              className="group flex items-center gap-4 border-t border-line py-4 last:border-b"
            >
              <span className="min-w-0 flex-1">
                <span className="font-semibold transition-colors group-hover:text-accent">
                  {TAG_LABELS[tag]}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-ink-soft">
                  {TAG_DESCRIPTIONS[tag]}
                </span>
              </span>
              <span className="shrink-0 text-xs tabular-nums text-ink-muted">
                {counts[tag]}편
              </span>
              <span className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          ))}
        </nav>

        <Link
          href="/blog/diary"
          className="group mb-12 flex items-center gap-4 rounded-md border border-dashed border-line px-4 py-4"
        >
          <span className="min-w-0 flex-1">
            <span className="font-semibold transition-colors group-hover:text-accent">
              일기
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-ink-soft">
              비밀번호를 아는 사람만 볼 수 있어요.
            </span>
          </span>
          <span className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>

        <h2 className="mb-6 text-xs tracking-[0.18em] text-ink-muted">
          전체 글 {posts.length}편
        </h2>
        <PostList posts={posts} />
      </div>
    </Container>
  );
}
