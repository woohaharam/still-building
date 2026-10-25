import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { adfitUnit } from '@/lib/site';

/**
 * 개인정보 처리방침이 광고에 대해 약속한 두 가지를 지키는지 본다.
 *
 *   1. 광고를 끄면 "광고와 광고용 추적 스크립트도 없습니다" 가 떠 있다.
 *   2. 광고를 켜도 "이력서·프로젝트·소개 페이지에는 광고가 없습니다" 가
 *      사실이다.
 *
 * 둘 다 컴파일러가 못 본다. 2번은 누가 <AdFit /> 을 다른 페이지에 한 줄
 * 더하는 것만으로 거짓말이 된다. 방침은 법적 문서라 화면과 어긋나면 안 된다.
 */

const ROOT = process.cwd();
const APP = join(ROOT, 'app');

/** 광고를 붙여도 되는 곳. 글을 다 읽은 자리다. */
const ALLOWED = ['posts/[slug]/page.tsx'];

function tsxFilesIn(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) tsxFilesIn(full, out);
    else if (name.endsWith('.tsx')) out.push(full);
  }
  return out;
}

describe('adfitUnit', () => {
  it('ID 는 비어 있거나 DAN- 으로 시작한다', () => {
    // 애드핏이 발급하는 광고단위 ID 의 생김새다. 오타로 다른 값이 들어가면
    // 광고가 조용히 안 뜨는데, 화면만 봐서는 켜진 건지 틀린 건지 모른다.
    if (adfitUnit.id) expect(adfitUnit.id).toMatch(/^DAN-/);
  });

  it('크기가 양수다', () => {
    expect(adfitUnit.width).toBeGreaterThan(0);
    expect(adfitUnit.height).toBeGreaterThan(0);
  });
});

describe('광고 위치', () => {
  const users = tsxFilesIn(APP)
    .filter((file) => /<AdFit\b/.test(readFileSync(file, 'utf8')))
    .map((file) => relative(APP, file).replaceAll('\\', '/'));

  it('글 페이지에만 붙어 있다', () => {
    expect(users.sort()).toEqual([...ALLOWED].sort());
  });
});

describe('개인정보 처리방침', () => {
  const privacy = readFileSync(join(APP, 'privacy/page.tsx'), 'utf8');

  it('광고를 켜고 끄는 값을 직접 읽는다', () => {
    // 방침이 adfitUnit 을 안 보면 광고 상태와 따로 놀게 된다.
    expect(privacy).toContain('adfitUnit');
  });

  it('광고가 꺼져 있을 때 보여줄 문구를 갖고 있다', () => {
    expect(privacy).toContain('광고와');
    expect(privacy).toContain('광고용 추적 스크립트도 없습니다');
  });

  it('광고를 켜면 시행일도 올라간다', () => {
    // 방침 내용이 달라지는 날이다. 광고만 켜고 날짜를 그대로 두면 언제부터
    // 광고를 받았는지가 문서에 안 남는다.
    const date = /const EFFECTIVE_DATE = (.+);/.exec(privacy)?.[1];
    expect(date).toBeTruthy();
    if (adfitUnit.id) expect(date).not.toBe('PRE_AD_DATE');
  });

  it('광고가 켜졌을 때 어디에 뜨는지와 무엇이 넘어가는지 적는다', () => {
    expect(privacy).toContain('애드핏');
    expect(privacy).toContain('카카오');
    // 1항의 약속. 위의 '광고 위치' 테스트가 이게 사실인지 지킨다.
    expect(privacy).toContain(
      '이력서·프로젝트·소개 페이지에는 광고가 없습니다'
    );
  });
});
