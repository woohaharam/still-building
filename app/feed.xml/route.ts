import { buildRssFeed } from '@/lib/feed';
import { getPublishedPosts } from '@/lib/posts';

export const revalidate = 0;

export async function GET() {
  const posts = await getPublishedPosts();

  return new Response(buildRssFeed(posts), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
