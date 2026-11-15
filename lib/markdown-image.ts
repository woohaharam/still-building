import { ImageSize, isImageSize } from './image-size';

/**
 * 본문에 적힌 사진을 다루는 계산.
 *
 * 전부 문자열만 받고 문자열만 낸다. 편집기에서 떼어내야 테스트에서 그냥
 * 부를 수 있고, 무엇이 틀렸는지도 화면을 띄우지 않고 알 수 있다.
 */

/**
 * ![설명](주소 "크기")
 *
 * 주소에 괄호가 들어가면 끊긴다. Supabase 가 주는 주소는 UUID 와 확장자뿐이라
 * 괄호가 올 일이 없다. 손으로 적은 주소까지 받으려고 식을 복잡하게 만들면
 * 읽기만 어려워진다.
 */
const IMAGE = /!\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)/g;

export interface MarkdownImage {
  /** 본문에서 몇 번째 사진인지. 0 부터. */
  index: number;
  /** 본문 안의 시작·끝 위치. */
  start: number;
  end: number;
  alt: string;
  url: string;
  size: ImageSize;
}

/** 본문에 든 사진을 앞에서부터 모은다. */
export function findImages(content: string): MarkdownImage[] {
  const found: MarkdownImage[] = [];

  for (const match of content.matchAll(IMAGE)) {
    found.push({
      index: found.length,
      start: match.index,
      end: match.index + match[0].length,
      alt: match[1],
      url: match[2],
      // 크기 이름이 아닌 제목은 그냥 제목이다. 그 경우 크기는 기본값이다.
      size: isImageSize(match[3]) ? match[3] : 'large',
    });
  }

  return found;
}

/** 사진 하나를 적는다. 기본 크기면 제목을 붙이지 않는다 — 없는 편이 깔끔하다. */
export function writeImage(alt: string, url: string, size: ImageSize): string {
  return `![${alt}](${url}${size === 'large' ? '' : ` "${size}"`})`;
}

/**
 * 몇 번째 사진의 크기를 바꾼다.
 *
 * 본문 전체를 다시 쓰지 않고 그 사진이 차지한 자리만 갈아끼운다. 같은 주소의
 * 사진을 두 번 넣었을 때 한쪽만 바꾸려면 주소가 아니라 자리로 찾아야 한다.
 */
export function resizeImage(
  content: string,
  index: number,
  size: ImageSize
): string {
  const image = findImages(content)[index];
  if (!image) return content;

  return (
    content.slice(0, image.start) +
    writeImage(image.alt, image.url, size) +
    content.slice(image.end)
  );
}

/** 몇 번째 사진의 주소를 바꾼다. 가린 사진을 새로 올리고 갈아끼울 때 쓴다. */
export function replaceImageUrl(
  content: string,
  index: number,
  url: string
): string {
  const image = findImages(content)[index];
  if (!image) return content;

  return (
    content.slice(0, image.start) +
    writeImage(image.alt, url, image.size) +
    content.slice(image.end)
  );
}

/**
 * 커서가 놓인 줄의 사진들을 한 줄로 모은다.
 *
 * 마크다운에서 같은 줄에 놓인 사진은 한 문단이 된다. 그려주는 쪽
 * (lib/markdown.tsx)이 사진만 든 문단을 가로로 펼치므로, 줄만 합치면
 * 나란히 놓인다. 새 문법을 만들지 않아도 된다.
 *
 * 위아래로 이어진 '사진만 있는 줄'을 묶는다. 중간에 글이 섞인 줄이 나오면
 * 거기서 멈춘다 — 글까지 끌어올리면 문단이 뒤섞인다.
 */
export function joinImageRow(
  content: string,
  cursor: number
): { value: string; selectionStart: number; selectionEnd: number } {
  const lines = content.split('\n');

  // 커서가 몇 번째 줄에 있는지. 줄바꿈 하나를 길이에 더해 센다.
  let offset = 0;
  let current = 0;
  for (const [i, line] of lines.entries()) {
    if (cursor <= offset + line.length) {
      current = i;
      break;
    }
    offset += line.length + 1;
    current = i;
  }

  if (!isImageOnly(lines[current])) {
    return { value: content, selectionStart: cursor, selectionEnd: cursor };
  }

  const first = reach(lines, current, -1);
  const last = reach(lines, current, 1);

  if (first === last) {
    return { value: content, selectionStart: cursor, selectionEnd: cursor };
  }

  const joined = lines
    .slice(first, last + 1)
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .join(' ');

  const next = [...lines.slice(0, first), joined, ...lines.slice(last + 1)];
  const before = next.slice(0, first).join('\n').length + (first > 0 ? 1 : 0);

  return {
    value: next.join('\n'),
    selectionStart: before,
    selectionEnd: before + joined.length,
  };
}

/**
 * 한쪽 방향으로 얼마나 멀리 사진 줄이 이어지는지.
 *
 * 빈 줄 하나는 건너뛴다. 사진을 넣을 때 앞뒤로 빈 줄을 붙이기 때문에
 * (lib/markdown-format.ts 의 insertBlock), 바로 붙은 줄만 보면 정작 제일
 * 흔한 경우를 못 합친다. 실제로 그렇게 짰다가 단추가 아무 일도 안 했다.
 *
 * 빈 줄 둘은 건너뛰지 않는다. 멀리 떨어진 사진까지 끌어오면 쓰는 사람이
 * 무엇이 합쳐질지 가늠할 수 없다.
 */
function reach(lines: string[], from: number, step: -1 | 1): number {
  let found = from;

  for (let i = from + step; i >= 0 && i < lines.length; i += step) {
    if (isImageOnly(lines[i])) {
      found = i;
      continue;
    }

    // 빈 줄 하나 너머가 사진 줄이면 이어진 것으로 본다.
    const beyond = i + step;
    if (
      lines[i].trim() === '' &&
      beyond >= 0 &&
      beyond < lines.length &&
      isImageOnly(lines[beyond])
    ) {
      continue;
    }

    break;
  }

  return found;
}

/**
 * 사진만 있는 줄인지. 빈 줄은 아니다.
 *
 * 사진을 전부 지우고 남는 게 없으면 사진만 있는 줄이다.
 *
 * IMAGE.test(line) 을 쓰면 안 된다. g 플래그가 붙은 정규식의 test 는
 * lastIndex 를 남겨서, 같은 식을 다음에 부를 때 중간부터 찾는다. 한 줄
 * 걸러 한 줄씩 틀리게 나온다. replace 와 matchAll 은 그 값을 건드리지 않는다.
 */
function isImageOnly(line: string | undefined): boolean {
  if (!line) return false;

  const hasImage = [...line.matchAll(IMAGE)].length > 0;
  return hasImage && line.replace(IMAGE, '').trim() === '';
}

/**
 * 본문 위치로 몇 번째 사진인지 찾는다.
 *
 * 미리보기에서 사진을 눌렀을 때 본문의 어느 사진인지 알아내는 데 쓴다.
 * react-markdown 이 그려준 조각마다 원본에서의 위치를 알려주므로, 그 값으로
 * 되짚으면 같은 주소의 사진이 여러 장이어도 틀리지 않는다.
 *
 * 세는 순서에 기대지 않는다. 화면을 그리는 순서는 React 사정에 따라 달라질
 * 수 있어서, 몇 번째로 그려졌는지로 세면 조용히 어긋난다.
 */
export function imageIndexAt(content: string, offset: number): number {
  return findImages(content).findIndex(
    (image) => offset >= image.start && offset < image.end
  );
}
