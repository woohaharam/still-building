import { sitemapEntries } from '@/lib/sitemap-entries';
import { buildSitemapXml } from '@/lib/sitemap';

export const revalidate = 0;

export async function GET() {
  let entries;

  try {
    entries = await sitemapEntries();
  } catch (error) {
    /**
     * app/feed.xml 과 같은 이유로 503 이다.
     *
     * 고정 페이지만 담아 200 으로 내보내면 수집기가 '글이 없는 사이트'로
     * 기록한다. 멀쩡한 답을 받았으니 곧 다시 오지도 않는다. 500 도 나쁘다 —
     * 고장난 사이트로 읽혀서 수집 빈도가 떨어진다.
     *
     * 503 + Retry-After 는 지금은 못 주니 이따 다시 오라는 뜻이고, 수집기는
     * 이미 색인한 주소를 지우지 않은 채 재시도한다.
     */
    console.error('sitemap.xml 생성 실패:', error);

    return new Response('일시적으로 사이트맵을 만들 수 없어요.', {
      status: 503,
      headers: {
        'Retry-After': '3600',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }

  return new Response(buildSitemapXml(entries), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
