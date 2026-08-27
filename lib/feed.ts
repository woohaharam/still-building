import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { postUrl, siteDescription, siteTitle, siteUrl } from './site';
import { metaDescription } from './text';
import { Post, tagLabel } from './types';

export function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * 본문 마크다운을 HTML 로 바꾼다.
 *
 * 플러그인이 전부 동기라 processSync 를 쓸 수 있다. 그래서 buildRssFeed 는
 * 지금처럼 동기 함수로 남는다.
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify);

function toHtml(markdown: string): string {
  return String(processor.processSync(markdown));
}

/**
 * CDATA 안에서 ']]>' 는 구획을 끝내버린다. 본문에 그 세 글자가 들어 있으면
 * 거기서 XML 이 깨지므로, 구획을 닫았다 다시 여는 방식으로 쪼갠다.
 */
function cdata(value: string) {
  return `<![CDATA[${value.replace(/\]\]>/g, ']]]]><![CDATA[>')}]]>`;
}

/**
 * 발행된 글을 RSS 2.0 으로 묶는다. 네이버는 사이트맵보다 이걸 더 많이 본다.
 *
 * description 에는 요약만, content:encoded 에는 본문 전체를 넣는다.
 * 요약 한 줄만 실어 보내면 수집기가 가져갈 글자가 그것뿐이라, 글이 있어도
 * 색인할 내용이 거의 없는 것처럼 보인다.
 */
export function buildRssFeed(posts: Post[]): string {
  const items = posts
    .map((post) => {
      const url = postUrl(post.slug);
      const date = post.published_at || post.created_at;
      const categories = (post.tags ?? [])
        .map((tag) => tagLabel(tag))
        .filter((label): label is string => !!label)
        .map((label) => `      <category>${escapeXml(label)}</category>`)
        .join('\n');

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${new Date(date).toUTCString()}</pubDate>
${categories ? `${categories}\n` : ''}      <description>${escapeXml(metaDescription(post))}</description>
      <content:encoded>${cdata(toHtml(post.content))}</content:encoded>
    </item>`;
    })
    .join('\n');

  const updated = new Date(
    posts[0]?.published_at || posts[0]?.created_at || Date.now()
  ).toUTCString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${escapeXml(`${siteUrl}/`)}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>ko</language>
    <lastBuildDate>${updated}</lastBuildDate>
    <atom:link href="${escapeXml(`${siteUrl}/feed.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}
