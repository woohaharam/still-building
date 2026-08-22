import { describe, expect, it } from 'vitest';
import { metaDescription, stripMarkdown } from '@/lib/text';

describe('stripMarkdown', () => {
  it('코드 블록을 통째로 버린다', () => {
    const result = stripMarkdown('앞\n\n```ts\nconst secret = 1;\n```\n\n뒤');
    expect(result).not.toContain('secret');
    expect(result).toContain('앞');
    expect(result).toContain('뒤');
  });

  it('링크는 보이는 글자만 남긴다', () => {
    expect(stripMarkdown('[네이버](https://naver.com)에 갔다')).toBe(
      '네이버에 갔다'
    );
  });

  it('이미지는 통째로 버린다', () => {
    expect(stripMarkdown('![스크린샷](https://x.com/a.png) 설명')).toBe('설명');
  });

  it('제목·인용·목록 기호를 걷어낸다', () => {
    expect(stripMarkdown('## 제목\n\n> 인용\n\n- 항목')).toBe('제목 인용 항목');
  });

  it('표 구분선을 남기지 않는다', () => {
    expect(stripMarkdown('| 표 | 도 |\n|---|---|')).not.toContain('-');
  });
});

describe('metaDescription', () => {
  it('요약이 있으면 그걸 쓴다', () => {
    expect(metaDescription({ excerpt: '직접 쓴 요약', content: '본문' })).toBe(
      '직접 쓴 요약'
    );
  });

  it('요약이 비어 있으면 본문 앞부분을 쓴다', () => {
    expect(
      metaDescription({ excerpt: '', content: '## 제목\n\n본문이다' })
    ).toBe('제목 본문이다');
  });

  it('요약이 null이어도 본문으로 넘어간다', () => {
    expect(metaDescription({ excerpt: null, content: '본문' })).toBe('본문');
  });

  it('공백뿐인 요약은 없는 것으로 본다', () => {
    expect(metaDescription({ excerpt: '   ', content: '본문' })).toBe('본문');
  });

  it('길면 잘라내고 말줄임표를 붙인다', () => {
    const result = metaDescription({ excerpt: '', content: '가'.repeat(400) });
    expect(result.length).toBeLessThanOrEqual(161);
    expect(result.endsWith('…')).toBe(true);
  });

  it('본문도 비어 있으면 빈 문자열', () => {
    expect(metaDescription({ excerpt: '', content: '' })).toBe('');
  });
});
