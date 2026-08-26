import type { Metadata } from 'next';
import Container from '@/components/Container';
import Landing from '@/components/Landing';
import { getPublishedPosts } from '@/lib/posts';
import { siteAuthor, siteAuthorAlias, siteUrl } from '@/lib/site';

export const revalidate = 0;

export const metadata: Metadata = {
  description: `${siteAuthor}(${siteAuthorAlias}) — 필요한 걸 직접 만들고, 만들면서 배운 걸 기록합니다.`,
  alternates: { canonical: siteUrl },
};

/** 글 수는 안내용이라, 못 불러와도 메인 전체가 에러 화면이 되지 않게 여기서 잡는다. */
async function countPosts(): Promise<{ postCount: number; failed: boolean }> {
  try {
    return { postCount: (await getPublishedPosts()).length, failed: false };
  } catch {
    return { postCount: 0, failed: true };
  }
}

export default async function HomePage() {
  const { postCount, failed } = await countPosts();

  return (
    <Container wide>
      <Landing postCount={postCount} failed={failed} />
    </Container>
  );
}
