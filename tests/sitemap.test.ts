import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildSitemapXml, SitemapEntry } from '@/lib/sitemap';

const ROOT = process.cwd();
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8');

describe('buildSitemapXml', () => {
  const entry = (over: Partial<SitemapEntry> = {}): SitemapEntry => ({
    url: 'https://example.com/posts/hello',
    ...over,
  });

  it('주소만 있어도 유효한 XML 을 낸다', () => {
    const xml = buildSitemapXml([entry()]);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    );
    expect(xml).toContain('<loc>https://example.com/posts/hello</loc>');
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
  });

  it('없는 항목은 빈 태그로 쓰지 않는다', () => {
    const xml = buildSitemapXml([entry()]);
    // 빈 lastmod 나 priority 가 들어가면 수집기가 형식 오류로 본다.
    expect(xml).not.toContain('<lastmod>');
    expect(xml).not.toContain('<changefreq>');
    expect(xml).not.toContain('<priority>');
  });

  it('우선순위 0 을 빠뜨리지 않는다', () => {
    // priority 는 0 이 올 수 있어서 truthy 로 거르면 사라진다.
    expect(buildSitemapXml([entry({ priority: 0 })])).toContain(
      '<priority>0</priority>'
    );
  });

  it('날짜를 ISO 로 적는다', () => {
    const xml = buildSitemapXml([
      entry({ lastModified: new Date('2026-10-24T00:00:00.000Z') }),
    ]);
    expect(xml).toContain('<lastmod>2026-10-24T00:00:00.000Z</lastmod>');
  });

  it('주소에 든 & 를 이스케이프한다', () => {
    // 한글 slug 는 인코딩되지만 쿼리가 붙으면 & 가 그대로 올 수 있다.
    const xml = buildSitemapXml([
      entry({ url: 'https://example.com/a?b=1&c=2' }),
    ]);
    expect(xml).toContain('&amp;');
    expect(xml).not.toMatch(/[^&]&[^a]/);
  });

  it('주소가 없으면 빈 urlset 을 낸다', () => {
    expect(buildSitemapXml([])).toContain('</urlset>');
  });
});

/**
 * 사이트맵과 RSS 는 실패했을 때 똑같이 굴어야 한다.
 *
 * 예전에 사이트맵만 달랐다. 조회가 실패하면 고정 페이지만 담아 200 으로
 * 내보내서, 수집기에게 '글이 하나도 없는 사이트'라고 알려주고 있었다.
 * 멀쩡한 답을 받았으니 곧 다시 오지도 않는다 — 새 글이 영영 색인에 안
 * 들어간다. app/feed.xml 은 처음부터 503 으로 맞게 하고 있었다.
 *
 * 둘이 다시 갈라지지 않게 묶어둔다.
 */
describe('실패했을 때', () => {
  const routes = ['app/sitemap.xml/route.ts', 'app/feed.xml/route.ts'];

  it.each(routes)('%s 는 503 과 Retry-After 로 답한다', (path) => {
    const source = read(path);
    expect(source).toContain('status: 503');
    expect(source).toContain("'Retry-After'");
  });

  it('사이트맵이 조회 실패를 삼키지 않는다', () => {
    const source = read('lib/sitemap-entries.ts');
    // try 로 감싸고 빈 배열로 넘어가면 다시 200 이 나간다.
    expect(source).not.toContain('catch');
  });
});
