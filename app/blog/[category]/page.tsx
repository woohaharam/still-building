import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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
 * 카테고리 주소는 세 개뿐이라 목록을 미리 알려줍니다.
 * 여기 없는 주소는 페이지가 돌기 전에 Next가 404로 돌려보내요.
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

  const posts = (await getPublishedPosts()).filter((post) =>
    post.tags?.includes(tag!)
  );

  return (
    <Container>
      <div>
        <section className="mb-10">
          <p className="text-xs tracking-[0.22em] text-ink-muted">
            {params.category.toUpperCase()}
          </p>
          <h1 className="mt-3 text-2xl font-bold leading-snug">
            {TAG_LABELS[tag!]} 글
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {TAG_DESCRIPTIONS[tag!]}
          </p>
        </section>

        <PostList
          posts={posts}
          showTagFilter={false}
          emptyLabel="이 카테고리"
        />
      </div>
    </Container>
  );
}
