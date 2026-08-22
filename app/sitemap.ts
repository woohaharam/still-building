import type { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/posts';
import { postUrl, siteUrl } from '@/lib/site';

export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();

  // 글이 새로 올라온 날을 사이트가 바뀐 날로 봐요.
  // (매번 '지금'을 넣으면 검색엔진이 계속 바뀌는 줄 알고 신뢰를 잃어요)
  const latest = posts[0]?.published_at || posts[0]?.created_at;
  const lastModified = latest ? new Date(latest) : undefined;

  return [
    {
      // 끝에 슬래시를 붙여요. 검색엔진에 등록한 주소와 글자 하나까지 같아야
      // '등록된 사이트와 다르다'고 반려당하지 않아요.
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
      url: `${siteUrl}/blog`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...posts.map((post) => ({
      url: postUrl(post.slug),
      lastModified: new Date(post.published_at || post.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
