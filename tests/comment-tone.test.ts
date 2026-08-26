import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  extractComments,
  extractSqlComments,
  hasPoliteEnding,
} from '@/lib/comment-tone';

const ROOT = process.cwd();
const SKIP = new Set(['node_modules', '.next', '.git', 'drafts']);

function walk(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|js|sql)$/.test(name) && !name.endsWith('.d.ts'))
      out.push(full);
  }
  return out;
}

describe('hasPoliteEnding', () => {
  it('평서체는 통과시킨다', () => {
    expect(hasPoliteEnding('목록을 최신순으로 정렬한다.')).toBe(false);
    expect(hasPoliteEnding('이건 비밀이 아니다.')).toBe(false);
    expect(hasPoliteEnding('공개값이라 문제가 아니다')).toBe(false);
  });

  it('해요체와 합니다체를 잡는다', () => {
    expect(hasPoliteEnding('목록을 정렬해요.')).toBe(true);
    expect(hasPoliteEnding('목록을 정렬합니다.')).toBe(true);
    expect(hasPoliteEnding('여기 적어둡니다.')).toBe(true);
    expect(hasPoliteEnding('그대로 두세요.')).toBe(true);
  });

  it('문체를 가리키는 단어 자체는 종결이 아니다', () => {
    expect(hasPoliteEnding('코드 주석은 평서체, 화면은 해요체다.')).toBe(false);
    expect(hasPoliteEnding('합니다체를 쓰지 않는다.')).toBe(false);
  });

  it('화면 문구를 인용한 부분은 봐준다', () => {
    expect(hasPoliteEnding('화면에 "글이 없어요"가 뜬다.')).toBe(false);
    expect(hasPoliteEnding("'열 수 없어요' 로 뭉뚱그리면 원인을 모른다.")).toBe(
      false
    );
  });
});

describe('extractComments', () => {
  it('문자열 안의 // 는 주석이 아니다', () => {
    const found = extractComments('const url = "https://example.com";');
    expect(found).toHaveLength(0);
  });

  it('줄 주석과 블록 주석을 모두 찾는다', () => {
    const found = extractComments('// 하나\nconst a = 1;\n/* 둘 */');
    expect(found.map((f) => f.text.trim())).toEqual(['// 하나', '/* 둘 */']);
  });

  it('블록 주석의 줄번호가 이어진다', () => {
    const found = extractComments('const a = 1;\n/*\n 안쪽\n*/');
    expect(found[1].line).toBe(3);
  });
});

describe('저장소 전체', () => {
  it('코드 주석에 존댓말이 없다', () => {
    const offenders: string[] = [];

    for (const file of walk(ROOT)) {
      const src = readFileSync(file, 'utf-8');
      const comments = file.endsWith('.sql')
        ? extractSqlComments(src)
        : extractComments(src);

      for (const { line, text } of comments) {
        if (hasPoliteEnding(text)) {
          offenders.push(`${relative(ROOT, file)}:${line}: ${text.trim()}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
