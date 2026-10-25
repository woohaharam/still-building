import { escapeXml } from './feed';

export interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency?: string;
  priority?: number;
}

/**
 * 주소 목록을 sitemap 0.9 XML 로 묶는다.
 *
 * 예전에는 Next 의 MetadataRoute.Sitemap 이 이 일을 대신 해줬다. 직접
 * 쓰게 된 건 실패했을 때 상태 코드를 503 으로 고르기 위해서다 — 그건
 * route handler 만 할 수 있다.
 */
export function buildSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      const parts = [`    <loc>${escapeXml(entry.url)}</loc>`];
      if (entry.lastModified) {
        parts.push(
          `    <lastmod>${entry.lastModified.toISOString()}</lastmod>`
        );
      }
      if (entry.changeFrequency) {
        parts.push(`    <changefreq>${entry.changeFrequency}</changefreq>`);
      }
      if (entry.priority !== undefined) {
        parts.push(`    <priority>${entry.priority}</priority>`);
      }
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}
