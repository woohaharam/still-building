import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CategoryNav from '@/components/CategoryNav';
import Container from '@/components/Container';
import PostList from '@/components/PostList';
import { getPublishedPosts } from '@/lib/posts';
import { siteUrl } from '@/lib/site';
import {
  POST_TAGS,
  TAG_DESCRIPTIONS,
  TAG_LABELS,
  TAG_SLUGS,
  tagFromSlug,
} from '@/lib/types';

export const revalidate = 0;

/**
 * 카테고리 주소는 세 개뿐이라 목록을 미리 알려준다.
 * 여기 없는 주소는 페이지가 돌기 전에 Next 가 404 로 돌려보낸다.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return POST_TAGS.map((tag) => ({ category: TAG_SLUGS[tag] }));
}

export function generateMetadata({
  params,
}: {
  params: { category: string };
}): Metadata {
  const tag = tagFromSlug(params.category);
  if (!tag) return { title: '없는 카테고리' };

  return {
    title: `${TAG_LABELS[tag]} 글`,
    description: TAG_DESCRIPTIONS[tag],
    alternates: { canonical: `${siteUrl}/blog/${params.category}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const tag = tagFromSlug(params.category);
  if (!tag) notFound();

  const all = await getPublishedPosts();
  const posts = all.filter((post) => post.tags?.includes(tag!));

  const counts = {
    all: all.length,
    ...Object.fromEntries(
      POST_TAGS.map((t) => [t, all.filter((p) => p.tags?.includes(t)).length])
    ),
  };

  return (
    <Container>
      <div className="flex flex-col gap-8">
        <section>
          <h1 className="text-2xl font-bold leading-snug">
            {TAG_LABELS[tag!]} 글
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {TAG_DESCRIPTIONS[tag!]}
          </p>
        </section>

        <CategoryNav active={tag!} counts={counts} />

        <PostList posts={posts} />
      </div>
    </Container>
  );
}
