import { describe, expect, it } from 'vitest';
import { slugify, toSlug } from '@/lib/slug';

describe('slugify', () => {
  it('공백을 하이픈으로 바꾼다', () => {
    expect(slugify('블로그를 만들며 부딪힌 문제')).toBe(
      '블로그를-만들며-부딪힌-문제'
    );
  });

  it('실제로 저장돼 있던 깨진 slug 들을 고친다', () => {
    // 공백은 %20, 대괄호는 %5B 로 바뀌어 주소가 고장난 것처럼 보였다.
    expect(slugify('26.08.14 ~ 26.08.16')).toBe('260814-260816');
    expect(slugify('[25.10.16 ~ 25.10.22]')).toBe('251016-251022');
    expect(slugify('25.08.29 ~ 25.08.31')).toBe('250829-250831');
    expect(slugify('[25.07.28 ~ 26.04.27]')).toBe('250728-260427');
  });

  it('주소에서 인코딩되는 기호를 뺀다', () => {
    for (const ch of ['?', '#', '&', '%', '/', '+', '"', "'", '(', ')']) {
      expect(slugify(`가${ch}나`)).toBe('가나');
    }
  });

  it('하이픈이 겹치거나 끝에 남지 않는다', () => {
    expect(slugify('가 - 나')).toBe('가-나');
    expect(slugify('---가---나---')).toBe('가-나');
    expect(slugify('가...')).toBe('가');
  });

  it('대문자를 소문자로 내린다', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('한글은 남긴다', () => {
    // 주소에서 부풀긴 하지만 브라우저가 되돌려 보여준다.
    expect(slugify('개발-일지')).toBe('개발-일지');
  });

  it('60자에서 자르고 하이픈으로 끝나지 않는다', () => {
    const long = slugify('가나다라마바사 '.repeat(20));
    expect(long.length).toBeLessThanOrEqual(60);
    expect(long.endsWith('-')).toBe(false);
  });

  it('쓸 글자가 없으면 빈 문자열이다', () => {
    expect(slugify('...')).toBe('');
    expect(slugify('   ')).toBe('');
    expect(slugify('')).toBe('');
  });
});

describe('toSlug', () => {
  it('직접 적은 값을 우선하되 다듬는다', () => {
    expect(toSlug('[내 글]', '제목')).toBe('내-글');
  });

  it('비워두면 제목에서 만든다', () => {
    expect(toSlug('', '제목 입니다')).toBe('제목-입니다');
  });

  it('적은 값이 기호뿐이면 제목으로 넘어간다', () => {
    expect(toSlug('...', '제목 입니다')).toBe('제목-입니다');
  });

  it('둘 다 쓸 수 없으면 빈 문자열이다', () => {
    // 부르는 쪽에서 저장을 막는다.
    expect(toSlug('...', '???')).toBe('');
  });
});
