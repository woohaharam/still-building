import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 제약 이름이 바뀌면 안내 문구가 조용히 안 걸린다. 화면에는 영어 원문이
 * 다시 뜨는데, 그건 저장이 실패한 순간에만 보여서 평소에는 모른다.
 *
 * 그래서 안내가 가리키는 제약이 SQL 에 실제로 있는지 본다.
 */
const hook = readFileSync(
  join(process.cwd(), 'lib/use-admin-collection.ts'),
  'utf8'
);
const duties = readFileSync(
  join(process.cwd(), 'supabase/12-service-duties.sql'),
  'utf8'
);

describe('저장 실패 안내', () => {
  const named = [...hook.matchAll(/^ {2}(\w+):\s*'/gm)].map((m) => m[1]);

  it('안내할 제약을 적어뒀다', () => {
    expect(named.length).toBeGreaterThan(0);
  });

  it.each(named)('%s 는 SQL 에 실제로 있는 제약이다', (constraint) => {
    expect(duties).toContain(constraint);
  });

  it('모르는 실패는 원문을 남긴다', () => {
    // 전부 뭉개면 무엇이 잘못됐는지 고칠 단서가 사라진다.
    expect(hook).toContain('저장 실패: ${error.message}');
  });
});
