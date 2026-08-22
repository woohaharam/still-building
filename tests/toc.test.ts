import { describe, expect, it } from 'vitest';
import { extractHeadings } from '@/lib/toc';

describe('extractHeadings', () => {
  it('## 와 ### 만 뽑는다', () => {
    const md = '# 문서 제목\n\n## 둘\n\n### 셋\n\n#### 넷\n\n본문';
    expect(extractHeadings(md).map((h) => h.text)).toEqual(['둘', '셋']);
  });

  it('단계를 구분한다', () => {
    const md = '## 큰 제목\n### 작은 제목';
    expect(extractHeadings(md).map((h) => h.level)).toEqual([2, 3]);
  });

  it('코드 블록 안의 #은 제목이 아니다', () => {
    const md = '## 진짜 제목\n\n```sh\n## 주석입니다\n```\n';
    expect(extractHeadings(md).map((h) => h.text)).toEqual(['진짜 제목']);
  });

  it('제목 안의 강조와 인라인 코드 표시를 지운다', () => {
    const md = '## `new Date()` 는 **위험**하다';
    expect(extractHeadings(md)[0].text).toBe('new Date() 는 위험하다');
  });

  it('제목 안의 링크는 글자만 남긴다', () => {
    const md = '## [네이버](https://naver.com)에 등록하기';
    expect(extractHeadings(md)[0].text).toBe('네이버에 등록하기');
  });

  it('같은 제목이 반복되면 id가 겹치지 않는다', () => {
    const md = '## 정리\n\n## 정리\n\n## 정리';
    const ids = extractHeadings(md).map((h) => h.id);
    expect(new Set(ids).size).toBe(3);
  });

  it('한글 제목에서 id가 비지 않는다', () => {
    const md = '## 관리자 비밀번호가 클라이언트 번들에 박혀 있었다';
    expect(extractHeadings(md)[0].id.length).toBeGreaterThan(0);
  });

  it('제목이 없으면 빈 배열', () => {
    expect(extractHeadings('그냥 본문만 있어요.')).toEqual([]);
  });
});

describe('extractHeadings — 인라인 코드', () => {
  it('코드 안의 밑줄을 지우지 않는다', () => {
    const md = '### `NEXT_PUBLIC_` 접두어의 함정';
    expect(extractHeadings(md)[0].text).toBe('NEXT_PUBLIC_ 접두어의 함정');
  });

  it('코드 안의 별표도 그대로 둔다', () => {
    const md = '## `a * b` 계산';
    expect(extractHeadings(md)[0].text).toBe('a * b 계산');
  });

  it('코드 밖의 강조는 지운다', () => {
    const md = '## **굵게** 와 _기울임_ 과 `code_1`';
    expect(extractHeadings(md)[0].text).toBe('굵게 와 기울임 과 code_1');
  });
});
