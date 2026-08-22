import GithubSlugger from 'github-slugger';

export interface Heading {
  /** 본문 제목에 붙는 id와 같은 값 */
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * 본문에서 ## / ### 제목만 뽑아 목차를 만들어요.
 *
 * id는 rehype-slug가 쓰는 github-slugger로 직접 만듭니다.
 * 규칙을 흉내내면 특수문자가 섞인 제목에서 어긋나고, 그러면 목차 링크가 조용히 죽어요.
 * 같은 제목이 두 번 나올 때 뒤에 번호를 붙이는 것도 이 라이브러리가 처리합니다.
 */
/**
 * 제목 줄을 화면에 보이는 글자로 바꿔요.
 *
 * 인라인 코드 안은 마크다운 문법이 아니라서 먼저 빼뒀다가 그대로 되돌립니다.
 * 그러지 않으면 `NEXT_PUBLIC_` 같은 코드의 밑줄까지 지워져서,
 * 본문 제목에 붙은 id와 어긋나 목차 링크가 죽어요.
 */
function inlineText(raw: string): string {
  const codes: string[] = [];
  let text = raw.replace(/`([^`]*)`/g, (_match, code: string) => {
    codes.push(code);
    return `\u0000${codes.length - 1}\u0000`;
  });

  text = text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    // 밑줄 강조는 앞뒤가 띄어쓰기일 때만. 단어 안의 밑줄은 글자 그대로예요.
    .replace(/(^|\s)__([^_]+)__(?=\s|$)/g, '$1$2')
    .replace(/(^|\s)_([^_]+)_(?=\s|$)/g, '$1$2');

  return text
    .replace(
      /\u0000(\d+)\u0000/g,
      (_match, index: string) => codes[Number(index)]
    )
    .trim();
}

export function extractHeadings(markdown: string): Heading[] {
  // 코드 블록 안의 # 은 주석이지 제목이 아니에요.
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, '');
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];

  for (const line of withoutCode.split('\n')) {
    const match = line.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/);
    if (!match) continue;

    const text = inlineText(match[2]);
    if (!text) continue;

    headings.push({
      id: slugger.slug(text),
      text,
      level: match[1].length === 2 ? 2 : 3,
    });
  }

  return headings;
}
