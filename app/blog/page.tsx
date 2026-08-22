import Container from '@/components/Container';
import type { Metadata } from 'next';
import PostList from '@/components/PostList';
import { getPublishedPosts } from '@/lib/posts';
import { siteUrl } from '@/lib/site';

export const revalidate = 0;

export const metadata: Metadata = {
  title: '블로그',
  description: '개발하면서 배운 것들과, 그 사이의 일상과 생각.',
  alternates: { canonical: `${siteUrl}/blog` },
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <Container>
      <div>
        <section className="mb-14">
          <h1 className="text-2xl font-bold leading-snug">
            코드를 짜고, 그 사이사이의 하루를 기록합니다.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            개발하면서 배운 것들과, 그 사이의 일상과 생각을 남겨두는 공간이에요.
          </p>
        </section>

        <PostList posts={posts} />
      </div>
    </Container>
  );
}
