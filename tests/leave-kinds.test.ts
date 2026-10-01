import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LEAVE_SCHEDULE } from '@/lib/service';
import { LEAVE_KINDS, LEAVE_KIND_LABELS, LeaveKind } from '@/lib/types';

/**
 * 종류를 하나 더할 때 손대야 하는 곳이 여덟 군데다. 그중 절반은
 * Record<LeaveKind, …> 라서 하나만 빠뜨려도 tsc 가 잡는다. 나머지 절반은
 * 아니다 — 배열, CSS 변수, tailwind 매핑, SQL 제약은 빠져도 빌드가 통과하고
 * 화면에서 색이 사라지거나 저장이 터지는 식으로 뒤늦게 드러난다.
 *
 * 여기서 보는 건 컴파일러가 못 보는 쪽만이다.
 */

const ROOT = process.cwd();
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8');

/** 클래스 이름에 쓰는 토막. 'special_outing' → 'special' 처럼 줄여 쓴 게 있다. */
const CSS_NAME: Record<LeaveKind, string> = {
  outing: 'outing',
  special_outing: 'special',
  leave: 'leave',
  final: 'final',
  off: 'off',
  exam_outing: 'exam',
  hospital: 'hospital',
  other: 'other',
};

describe('LEAVE_KINDS', () => {
  it('라벨 표에 있는 종류를 하나도 빠뜨리지 않는다', () => {
    expect([...LEAVE_KINDS].sort()).toEqual(
      Object.keys(LEAVE_KIND_LABELS).sort()
    );
  });

  it('같은 종류를 두 번 넣지 않는다', () => {
    expect(new Set(LEAVE_KINDS).size).toBe(LEAVE_KINDS.length);
  });

  it('사용자가 정한 순서대로 둔다', () => {
    // 관리자에서 누르는 자리 순서다. 바뀌면 손이 먼저 틀린다.
    expect(LEAVE_KINDS).toEqual([
      'outing',
      'special_outing',
      'leave',
      'final',
      'off',
      'exam_outing',
      'hospital',
      'other',
    ]);
  });

  it('라벨이 비어 있지 않고 서로 겹치지 않는다', () => {
    const labels = LEAVE_KINDS.map((kind) => LEAVE_KIND_LABELS[kind]);
    for (const label of labels) expect(label.trim()).not.toBe('');
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe('색', () => {
  const css = read('app/globals.css');
  const tailwind = read('tailwind.config.ts');
  const calendar = read('components/service/LeaveCalendar.tsx');

  /** :root 와 .dark 블록을 따로 떼어낸다. 두 곳 다 값이 있어야 한다. */
  function block(selector: string): string {
    const at = css.indexOf(selector);
    expect(at, `${selector} 블록이 있다`).toBeGreaterThan(-1);
    const open = css.indexOf('{', at);
    return css.slice(open, css.indexOf('\n}', open));
  }

  const light = block(':root {');
  const dark = block('.dark {');

  it.each(LEAVE_KINDS)(
    '%s 는 밝은 모드와 다크 모드 둘 다 색이 있다',
    (kind) => {
      const variable = `--leave-${CSS_NAME[kind]}:`;
      expect(light).toContain(variable);
      expect(dark).toContain(variable);
    }
  );

  it.each(LEAVE_KINDS)('%s 는 tailwind 에서 쓸 수 있다', (kind) => {
    expect(tailwind).toContain(`var(--leave-${CSS_NAME[kind]})`);
  });

  it.each(LEAVE_KINDS)('%s 는 달력에서 칸과 점을 받는다', (kind) => {
    expect(calendar).toContain(`bg-leave-${CSS_NAME[kind]}/15`);
    expect(calendar).toContain(`bg-leave-${CSS_NAME[kind]}'`);
  });
});

describe('SQL 제약', () => {
  /**
   * 종류를 더하고 마이그레이션을 안 쓰면 배포한 뒤 저장할 때 터진다.
   * 번호가 가장 큰 파일의 제약이 지금 DB 에 걸린 것이다.
   */
  it('마지막 마이그레이션이 모든 종류를 허용한다', () => {
    const latest = readdirSync(join(ROOT, 'supabase'))
      .filter((name) => name.endsWith('.sql'))
      .filter((name) =>
        read(`supabase/${name}`).includes('service_leaves_kind_check')
      )
      .sort()
      .at(-1);

    expect(latest, 'kind 제약을 거는 파일이 있다').toBeTruthy();
    const sql = read(`supabase/${latest}`);
    const constraint = sql.slice(sql.lastIndexOf('add constraint'));

    for (const kind of LEAVE_KINDS) expect(constraint).toContain(`'${kind}'`);
  });
});

describe('LEAVE_SCHEDULE', () => {
  it('복귀가 있으면 출영도 있다', () => {
    for (const kind of LEAVE_KINDS) {
      const { leftAt, returnedAt } = LEAVE_SCHEDULE[kind];
      if (returnedAt) expect(leftAt, kind).toBeTruthy();
    }
  });
});
