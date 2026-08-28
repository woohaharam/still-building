import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * loading.tsx 는 그 세그먼트와 아래 모든 자식에 스트리밍 경계를 만든다.
 * 스트리밍이 켜지면 헤더가 먼저 나가서 notFound() 가 상태 코드를 못 바꾸고,
 * 없는 주소가 200 으로 응답한다. 검색엔진은 그걸 '내용 없는 페이지'로 색인한다.
 *
 * 실제로 app/loading.tsx 하나 때문에 /posts/[slug] 와 /blog/[category] 가
 * 200 을 내보내고 있었다. 눈으로는 404 화면이 보여서 한참 몰랐다.
 */
const APP = join(process.cwd(), 'app');

/** notFound() 로 404 를 내보내야 하는 세그먼트. 여기 위쪽에 loading.tsx 가 있으면 안 된다. */
const NEEDS_404 = [
  'posts/[slug]',
  'blog/[category]',
  'projects/[slug]',
  'papers/[slug]',
];

function loadingFilesIn(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) loadingFilesIn(full, out);
    else if (name === 'loading.tsx') out.push(relative(APP, full));
  }
  return out;
}

describe('loading.tsx 위치', () => {
  it('404 가 나야 하는 세그먼트 위에는 두지 않는다', () => {
    const offenders: string[] = [];

    for (const route of NEEDS_404) {
      // 루트부터 해당 세그먼트까지 훑으면서 loading.tsx 가 있는지 본다.
      const parts = route.split('/');
      for (let i = 0; i <= parts.length; i++) {
        const dir = join(APP, ...parts.slice(0, i));
        if (existsSync(join(dir, 'loading.tsx'))) {
          offenders.push(
            `${route} ← ${join(...parts.slice(0, i), 'loading.tsx')}`
          );
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it('남겨둔 loading.tsx 는 달력뿐이다', () => {
    // 달력은 없는 주소가 없고 자식 세그먼트도 없어서 안전하다.
    expect(loadingFilesIn(APP).sort()).toEqual(['calendar/loading.tsx']);
  });
});
