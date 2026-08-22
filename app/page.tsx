import type { Metadata } from 'next';
import Container from '@/components/Container';
import Landing from '@/components/Landing';
import { getPublishedPosts } from '@/lib/posts';
import { siteAuthor, siteAuthorAlias, siteUrl } from '@/lib/site';
import { Post } from '@/lib/types';

export const revalidate = 0;

export const metadata: Metadata = {
  description: `${siteAuthor}(${siteAuthorAlias}) — 필요한 걸 직접 만들고, 만들면서 배운 걸 기록합니다.`,
  alternates: { canonical: siteUrl },
};

/**
 * 소개와 만든 것들은 데이터베이스와 상관이 없어요.
 * 글을 못 불러와도 그 부분까지 에러 화면으로 덮이면 곤란하니, 여기서만 따로 받아둡니다.
 */
async function loadPosts(): Promise<{
  posts: Post[];
  total: number;
  failed: boolean;
}> {
  try {
    const posts = await getPublishedPosts();
    return { posts: posts.slice(0, 3), total: posts.length, failed: false };
  } catch {
    return { posts: [], total: 0, failed: true };
  }
}

export default async function HomePage() {
  const { posts, total, failed } = await loadPosts();

  return (
    <Container wide>
      <Landing posts={posts} total={total} failed={failed} />
    </Container>
  );
}
