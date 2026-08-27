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

describe('content:encoded', () => {
  it('네임스페이스를 선언한다', () => {
    const xml = buildRssFeed([makePost()]);
    expect(xml).toContain(
      'xmlns:content="http://purl.org/rss/1.0/modules/content/"'
    );
  });

  it('본문을 마크다운이 아니라 HTML로 싣는다', () => {
    const xml = buildRssFeed([
      makePost({ content: '## 제목\n\n**굵게** 그리고 `코드`.' }),
    ]);
    expect(xml).toContain('<h2>제목</h2>');
    expect(xml).toContain('<strong>굵게</strong>');
    expect(xml).toContain('<code>코드</code>');
    expect(xml).not.toContain('## 제목');
  });

  it('요약과 본문을 둘 다 싣는다', () => {
    const xml = buildRssFeed([
      makePost({ excerpt: '한 줄 요약', content: '본문은 훨씬 길다.' }),
    ]);
    expect(xml).toContain('<description>한 줄 요약</description>');
    expect(xml).toContain('본문은 훨씬 길다.');
  });

  it('본문 안의 ]]> 가 CDATA 를 끝내지 않는다', () => {
    // 쪼개지 않으면 여기서 XML 이 통째로 깨진다.
    const xml = buildRssFeed([makePost({ content: '배열은 `a[b[c]]>d` 꼴' })]);
    const body = xml.slice(xml.indexOf('<content:encoded>'));
    const opens = (body.match(/<!\[CDATA\[/g) || []).length;
    const closes = (body.match(/\]\]>/g) || []).length;
    expect(opens).toBe(closes);
    expect(xml).toContain('<item>');
  });

  it('표와 목록도 HTML로 나온다', () => {
    const xml = buildRssFeed([
      makePost({ content: '- 하나\n- 둘\n\n| a | b |\n| - | - |\n| 1 | 2 |' }),
    ]);
    expect(xml).toContain('<li>하나</li>');
    expect(xml).toContain('<table>');
  });

  it('태그를 category 로 싣는다', () => {
    const xml = buildRssFeed([makePost({ tags: ['tech'] })]);
    expect(xml).toContain('<category>개발</category>');
  });

  it('모르는 태그는 category 에서 뺀다', () => {
    const xml = buildRssFeed([
      makePost({ tags: ['constructor' as never, 'life'] }),
    ]);
    expect(xml).toContain('<category>일상</category>');
    expect(xml).not.toContain('<category>constructor</category>');
  });
});
