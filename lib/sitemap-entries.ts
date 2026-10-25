import { getPublishedBooks } from '@/lib/books';
import { getPublishedPosts } from '@/lib/posts';
import { getPublishedTrips } from '@/lib/trips';
import { PROJECTS } from '@/lib/projects';
import { PUBLICATIONS } from '@/lib/publications';
import { postUrl, siteUrl } from '@/lib/site';
import { SitemapEntry } from '@/lib/sitemap';
import { POST_TAGS, TAG_SLUGS } from '@/lib/types';

/** 사이트맵에 실을 주소 목록. 조회가 실패하면 던진다. */
export async function sitemapEntries(): Promise<SitemapEntry[]> {
  /*
    못 읽으면 던진다. 삼키면 안 된다.

    예전에는 세 조회를 각각 try 로 감싸서, 실패하면 고정 페이지만 담아
    내보냈다. 그게 틀렸다 — 수집기는 200 을 받고 '글이 하나도 없는 사이트'
    로 기록한다. 멀쩡한 답을 받았으니 곧 다시 올 이유도 없다. 색인이
    지워지는 게 아니라 새 글이 영영 안 들어간다.

    app/feed.xml 은 처음부터 이렇게 하고 있었다. 거기 주석에 이유가 그대로
    적혀 있다. 사이트맵만 다르게 굴 이유가 없다.

    던지면 route 가 503 + Retry-After 로 바꿔서 "지금은 못 주니 이따 다시
    오라"고 정확히 말한다.
  */
  const [posts, books, trips] = await Promise.all([
    getPublishedPosts(),
    getPublishedBooks(),
    getPublishedTrips(),
  ]);

  // 글이 새로 올라온 날을 사이트가 바뀐 날로 본다.
  // (매번 '지금'을 넣으면 검색엔진이 계속 바뀌는 줄 알고 신뢰를 잃는다)
  const latest = posts[0]?.published_at || posts[0]?.created_at;
  const lastModified = latest ? new Date(latest) : undefined;

  return [
    {
      // 끝에 슬래시를 붙인다. 검색엔진에 등록한 주소와 글자 하나까지 같아야
      // '등록된 사이트와 다르다'고 반려당하지 않는다.
      url: `${siteUrl}/`,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/calendar`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/about`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/resume`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      // 포트폴리오가 아니라 개인 기록이라 우선순위를 낮게 둔다.
      url: `${siteUrl}/service`,
      changeFrequency: 'weekly' as const,
      priority: 0.3,
    },
    {
      url: `${siteUrl}/privacy`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/projects`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/papers`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/activities`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...PROJECTS.map((project) => ({
      url: `${siteUrl}/projects/${project.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...PUBLICATIONS.map((paper) => ({
      url: `${siteUrl}/papers/${paper.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    {
      url: `${siteUrl}/blog`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...POST_TAGS.map((tag) => ({
      url: `${siteUrl}/blog/${TAG_SLUGS[tag]}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...posts.map((post) => ({
      url: postUrl(post.slug),
      lastModified: new Date(post.published_at || post.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    {
      url: `${siteUrl}/books`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    ...books.map((book) => ({
      url: `${siteUrl}/books/${encodeURIComponent(book.slug)}`,
      lastModified: new Date(book.finished_at || book.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    {
      url: `${siteUrl}/travel`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    ...trips.map((trip) => ({
      url: `${siteUrl}/travel/${encodeURIComponent(trip.slug)}`,
      lastModified: new Date(trip.started_on),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
