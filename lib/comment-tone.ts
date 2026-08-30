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
 * 종결의 '요' 앞 음절은 받침이 없고, 모음이 어미에 쓰이는 것들이다
 * ('가져와요' · '감춰요' · '그려요' · '남겨요' · '빼요').
 *
 * 명사로 끝나는 '요'는 이 조건에서 걸러진다. 필요·중요는 앞 음절에 받침이
 * 있고, 주요·수요는 모음이 ㅜ라 어미가 될 수 없다.
 */
const ENDING_VOWELS = new Set([0, 1, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15]);

function isPoliteYo(ch: string): boolean {
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  const offset = code - 0xac00;
  if (offset % 28 !== 0) return false; // 받침이 있으면 어미가 아니다
  return ENDING_VOWELS.has(Math.floor(offset / 28) % 21);
}

export function hasPoliteEnding(text: string): boolean {
  // 주석이 화면 문구를 인용한 자리는 원문이라 건드리지 않는다.
  const bare = text.replace(/"[^"]*"|'[^']*'|`[^`]*`/g, '');

  // 뒤에 글자가 더 붙으면 종결이 아니라 단어의 일부다 ('해요체'처럼).
  let yo = bare.indexOf('요');
  while (yo !== -1) {
    const next = bare[yo + 1];
    const isWordEnd = !next || !/[가-힣]/.test(next);
    if (yo > 0 && isWordEnd && isPoliteYo(bare[yo - 1])) return true;
    yo = bare.indexOf('요', yo + 1);
  }

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

/**
 * CSS 는 /* *\/ 하나뿐이고 문자열 안에 주석 기호가 들어갈 일이 거의 없다.
 * 그래서 블록만 훑는다.
 */
export function extractCssComments(src: string) {
  const out: { line: number; text: string }[] = [];
  let i = 0;
  let line = 1;

  while (i < src.length) {
    if (src[i] === '\n') {
      line++;
      i++;
      continue;
    }
    if (src[i] === '/' && src[i + 1] === '*') {
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
    i++;
  }

  return out;
}
