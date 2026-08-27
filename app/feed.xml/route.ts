import { buildRssFeed } from '@/lib/feed';
import { getPublishedPosts } from '@/lib/posts';

export const revalidate = 0;

export async function GET() {
  let posts;

  try {
    posts = await getPublishedPosts();
  } catch (error) {
    /**
     * 글을 못 읽었으면 빈 피드를 내주면 안 된다. 수집기가 그걸 보고 글이
     * 하나도 없는 블로그로 판단한다. 500 도 나쁘다. "이 사이트는 고장났다"로
     * 읽혀서 수집 빈도가 떨어진다.
     *
     * 503 + Retry-After 가 정확한 뜻이다. 지금은 못 주니 이따 다시 오라는
     * 신호고, 수집기는 이걸 알아듣고 목록을 지우지 않은 채 재시도한다.
     */
    console.error('feed.xml 생성 실패:', error);

    return new Response('일시적으로 피드를 만들 수 없어요.', {
      status: 503,
      headers: {
        'Retry-After': '3600',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }

  return new Response(buildRssFeed(posts), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
