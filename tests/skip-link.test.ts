import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * 키보드로 들어오면 헤더 링크 아홉 개를 지나야 본문에 닿는다. 페이지를
 * 옮길 때마다 아홉 번이다. 건너뛰기 링크가 그걸 한 번으로 줄인다
 * (WCAG 2.4.1 Bypass Blocks, A 등급).
 *
 * 세 조각이 다 있어야 동작한다. 하나만 빠져도 화면상으로는 멀쩡해 보여서
 * 눈으로는 깨진 걸 모른다 — 키보드로 눌러봐야 안다.
 *
 *   a[href="#main"]   건너뛸 링크
 *   sr-only           평소엔 숨기되, 초점은 받을 수 있게
 *   main id tabIndex  받은 초점이 앉을 자리
 *
 * tabIndex 가 빠지면 특히 티가 안 난다. 주소창만 #main 으로 바뀌고 초점은
 * 헤더에 남아서, 다음 Tab 이 다시 소개 · 프로젝트로 돌아간다.
 */
const layout = readFileSync(join(process.cwd(), 'app/layout.tsx'), 'utf8');

describe('건너뛰기 링크', () => {
  it('본문을 가리키는 링크가 있다', () => {
    expect(layout).toContain('href="#main"');
    expect(layout).toContain('본문으로 건너뛰기');
  });

  it('평소에는 숨고 초점을 받으면 나타난다', () => {
    // display:none 으로 숨기면 초점이 가지 않아 Tab 으로 꺼낼 수가 없다.
    expect(layout).toContain('sr-only');
    expect(layout).toContain('focus:not-sr-only');
  });

  it('헤더보다 먼저 나온다', () => {
    // 뒤에 두면 헤더를 다 지난 뒤에야 나와서 건너뛸 것이 남지 않는다.
    expect(layout.indexOf('href="#main"')).toBeLessThan(
      layout.indexOf('<Header />')
    );
  });

  it('본문이 초점을 받을 수 있다', () => {
    const main = /<main[^>]*>/.exec(layout)?.[0] ?? '';
    expect(main).toContain('id="main"');
    // -1 이라 Tab 순서에는 끼지 않으면서 초점은 받는다.
    expect(main).toContain('tabIndex={-1}');
  });
});
