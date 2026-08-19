import type { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/posts';
import { postUrl, siteUrl } from '@/lib/site';

export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();

  const staticPages = ['', '/calendar', '/about'].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  return [
    ...staticPages,
    ...posts.map((post) => ({
      url: postUrl(post.slug),
      lastModified: new Date(post.published_at || post.created_at),
    })),
  ];
}
