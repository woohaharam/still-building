import { describe, expect, it } from 'vitest';
import { buildRssFeed, escapeXml } from '@/lib/feed';
import { Post } from '@/lib/types';

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: '1',
    slug: 'hello',
    title: '제목',
    excerpt: '요약',
    content: '본문',
    tags: [],
    cover_image_url: null,
    view_count: 0,
    share_count: 0,
    published: true,
    published_at: '2026-08-16T09:00:00Z',
    created_at: '2026-08-16T09:00:00Z',
    ...overrides,
  };
}

describe('escapeXml', () => {
  it('XML에서 의미를 갖는 다섯 글자를 바꾼다', () => {
    expect(escapeXml(`R&D <b>"x"</b> 'y'`)).toBe(
      'R&amp;D &lt;b&gt;&quot;x&quot;&lt;/b&gt; &apos;y&apos;'
    );
  });
});

describe('buildRssFeed', () => {
  it('RSS 2.0 뼈대를 갖춘다', () => {
    const xml = buildRssFeed([makePost()]);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain('<channel>');
    expect(xml).toContain('<lastBuildDate>');
  });

  it('글 수만큼 item을 만든다', () => {
    const xml = buildRssFeed([
      makePost({ id: '1', slug: 'a' }),
      makePost({ id: '2', slug: 'b' }),
    ]);
    expect(xml.match(/<item>/g)?.length).toBe(2);
  });

  it('글이 없어도 깨지지 않는다', () => {
    const xml = buildRssFeed([]);
    expect(xml).toContain('<channel>');
    expect(xml).not.toContain('<item>');
  });

  it('제목의 &를 이스케이프한다', () => {
    const xml = buildRssFeed([makePost({ title: 'R&D 기록' })]);
    expect(xml).toContain('R&amp;D 기록');
    expect(xml).not.toContain('<title>R&D');
  });

  it('한글 slug를 퍼센트 인코딩한다', () => {
    const xml = buildRssFeed([makePost({ slug: '첫-기록' })]);
    expect(xml).toContain('%EC%B2%AB-%EA%B8%B0%EB%A1%9D');
    expect(xml).not.toContain('/posts/첫-기록');
  });

  it('요약이 없는 글도 설명이 비지 않는다', () => {
    const xml = buildRssFeed([
      makePost({ excerpt: '', content: '본문 첫 문장' }),
    ]);
    expect(xml).toContain('<description>본문 첫 문장</description>');
  });

  it('pubDate가 RFC 822 형식이다', () => {
    const xml = buildRssFeed([makePost()]);
    expect(xml).toContain('<pubDate>Sun, 16 Aug 2026 09:00:00 GMT</pubDate>');
  });
});
