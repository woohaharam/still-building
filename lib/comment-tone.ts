/**
 * 주석 문체 검사.
 *
 * 코드 주석은 평서체로 쓴다. 화면에 뜨는 문구만 해요체다. 이 규칙을 손으로
 * 지키려다 세 번 놓쳤고, 그때마다 다 고쳤다고 잘못 말했다. 그래서 기계가
 * 세도록 옮겼다.
 */

/** 'ㅂ니다' 종결의 앞 음절은 받침이 ㅂ이다. '아니다'는 그래서 걸리지 않는다. */
function endsWithBieup(ch: string): boolean {
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 === 17;
}

/**
 * 말끝에서만 센다. 뒤에 글자가 더 붙으면 종결이 아니라 단어의 일부다
 * ('해요체', '합니다체'처럼).
 */
const TAIL = /(해요|어요|에요|예요|세요|돼요|봐요|줘요)(?![가-힣])/;

export function hasPoliteEnding(text: string): boolean {
  // 주석이 화면 문구를 인용한 자리는 원문이라 건드리지 않는다.
  const bare = text.replace(/"[^"]*"|'[^']*'|`[^`]*`/g, '');

  if (TAIL.test(bare)) return true;

  let at = bare.indexOf('니다');
  while (at !== -1) {
    const next = bare[at + 2];
    const isWordEnd = !next || !/[가-힣]/.test(next);
    if (at > 0 && endsWithBieup(bare[at - 1]) && isWordEnd) return true;
    at = bare.indexOf('니다', at + 1);
  }
  return false;
}

/** 문자열·정규식을 건너뛰고 주석만 (줄번호, 내용)으로 뽑는다. */
export function extractComments(src: string): { line: number; text: string }[] {
  const out: { line: number; text: string }[] = [];
  let i = 0;
  let line = 1;

  while (i < src.length) {
    const c = src[i];

    if (c === '\n') {
      line++;
      i++;
      continue;
    }

    if (c === '/' && src[i + 1] === '/') {
      const end = src.indexOf('\n', i);
      const stop = end === -1 ? src.length : end;
      out.push({ line, text: src.slice(i, stop) });
      i = stop;
      continue;
    }

    if (c === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      const stop = end === -1 ? src.length : end + 2;
      const block = src.slice(i, stop);
      block
        .split('\n')
        .forEach((text, k) => out.push({ line: line + k, text }));
      line += (block.match(/\n/g) || []).length;
      i = stop;
      continue;
    }

    // 문자열 안의 // 나 /* 는 주석이 아니다.
    if (c === '"' || c === "'" || c === '`') {
      const quote = c;
      i++;
      while (i < src.length) {
        if (src[i] === '\\') {
          i += 2;
          continue;
        }
        if (src[i] === '\n') line++;
        if (src[i] === quote) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    i++;
  }

  return out;
}

/** SQL 은 -- 만 쓴다. */
export function extractSqlComments(src: string) {
  return src
    .split('\n')
    .map((text, k) => ({ line: k + 1, text: text.trim() }))
    .filter((row) => row.text.startsWith('--'));
}
