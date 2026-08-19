import { postUrl, siteDescription, siteName, siteUrl } from './site';
import { metaDescription } from './text';
import { Post } from './types';

export function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** 발행된 글을 RSS 2.0으로 묶어요. 네이버는 사이트맵보다 이걸 더 많이 봅니다. */
export function buildRssFeed(posts: Post[]): string {
  const items = posts
    .map((post) => {
      const url = postUrl(post.slug);
      const date = post.published_at || post.created_at;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${new Date(date).toUTCString()}</pubDate>
      <description>${escapeXml(metaDescription(post))}</description>
    </item>`;
    })
    .join('\n');

  const updated = new Date(
    posts[0]?.published_at || posts[0]?.created_at || Date.now()
  ).toUTCString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${escapeXml(`${siteUrl}/`)}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>ko</language>
    <lastBuildDate>${updated}</lastBuildDate>
    <atom:link href="${escapeXml(`${siteUrl}/feed.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}
