import type { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/posts';
import { PROJECTS } from '@/lib/projects';
import { PUBLICATIONS } from '@/lib/publications';
import { postUrl, siteUrl } from '@/lib/site';
import { POST_TAGS, TAG_SLUGS } from '@/lib/types';

export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();

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
      url: `${siteUrl}/privacy`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/projects`,
      changeFrequency: 'monthly',
      priority: 0.8,
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
  ];
}
