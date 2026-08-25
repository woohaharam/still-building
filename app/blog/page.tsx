import type { Metadata } from 'next';
import CategoryNav from '@/components/CategoryNav';
import Container from '@/components/Container';
import PostList from '@/components/PostList';
import { getPublishedPosts } from '@/lib/posts';
import { siteUrl } from '@/lib/site';
import { POST_TAGS } from '@/lib/types';

export const revalidate = 0;

export const metadata: Metadata = {
  title: '블로그',
  description: '개발하면서 배운 것들과, 그 사이의 일상과 생각.',
  alternates: { canonical: `${siteUrl}/blog` },
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  const counts = {
    all: posts.length,
    ...Object.fromEntries(
      POST_TAGS.map((tag) => [
        tag,
        posts.filter((post) => post.tags?.includes(tag)).length,
      ])
    ),
  };

  return (
    <Container>
      <div className="flex flex-col gap-8">
        <section>
          <h1 className="text-2xl font-bold leading-snug">
            코드를 짜고, 그 사이사이의 하루를 기록합니다.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            개발 글이 본체고, 나머지는 그 사이의 기록이에요.
          </p>
        </section>

        <CategoryNav active="all" counts={counts} />

        <PostList posts={posts} />
      </div>
    </Container>
  );
}
