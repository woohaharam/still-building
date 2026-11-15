import type { Components } from 'react-markdown';
import CodeBlock from '@/components/CodeBlock';
import { imageSizeClass, isImageSize } from './image-size';

/** react-markdown 이 넘겨주는 원본 조각 중 우리가 보는 만큼만. */
interface HastNode {
  type?: string;
  tagName?: string;
  value?: string;
  children?: HastNode[];
}

/**
 * 사진만 든 문단인지, 그 안에 사진이 몇 장인지.
 *
 * 마크다운에서 같은 줄에 놓인 사진들은 한 문단이 된다. 그걸 가로로 펼치면
 * 새 문법 없이 '나란히 놓기'가 된다 (lib/markdown-image.ts 의 joinImageRow).
 *
 * 글이 한 글자라도 섞이면 세로로 둔다. 사진 옆에 설명을 적은 문단까지
 * 가로로 펴면 글이 사진 옆에 끼어 읽기 어려워진다.
 *
 * 그려진 children 이 아니라 원본 조각(node)을 본다. children 을 보면
 * 안 된다 — react-markdown 은 p 를 부르기 전에 자식들을 이미 우리가 지정한
 * img 컴포넌트로 바꿔둔다. 그래서 type 이 'img' 라는 문자열이 아니라 그
 * 함수가 되고, 문자열과 견주면 언제나 어긋난다. 실제로 그렇게 짰다가
 * 사진이 나란히 놓이지 않아서 알았다.
 */
function imagesInRow(node: HastNode | undefined): number {
  const children = node?.children;
  if (!children) return 0;

  let images = 0;

  for (const child of children) {
    if (child.type === 'text') {
      // 사진 사이의 공백이나 줄바꿈은 넘긴다.
      if ((child.value ?? '').trim() !== '') return 0;
      continue;
    }

    if (child.tagName === 'img') {
      images += 1;
      continue;
    }

    return 0;
  }

  return images;
}

/**
 * 글 본문과 관리자 미리보기가 같이 쓰는 렌더링 규칙.
 * 한쪽에만 손대면 미리보기와 실제가 달라지기 때문에 한곳에 뒀다.
 */
export const markdownComponents: Components = {
  pre: CodeBlock,

  /**
   * 사진만 든 문단은 가로로 펼친다.
   *
   * p 를 통째로 바꾼다. 안에 div 를 넣으면 p 안에 블록이 들어가 브라우저가
   * 문단을 끊어버린다.
   *
   * 폭은 장수로 나눠 가진다. 좁은 화면에서는 두 장까지만 나란히 두고 그
   * 이상은 접는다 — 네 장을 한 줄에 두면 한 장이 손톱만 해진다.
   */
  p({ children, node }) {
    const images = imagesInRow(node);

    if (images < 2) return <p>{children}</p>;

    return (
      <span
        className={`my-6 grid gap-2 ${
          images === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
        } [&>img]:my-0 [&>img]:h-full [&>img]:w-full [&>img]:max-w-none [&>img]:object-cover`}
      >
        {children}
      </span>
    );
  },

  img({ src, alt, title }) {
    if (!src) return null;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt || ''}
        // 크기로 읽은 값은 말풍선으로 새지 않게 지운다.
        title={isImageSize(title) ? undefined : title}
        loading="lazy"
        className={`rounded-lg ${imageSizeClass(title)}`}
      />
    );
  },
};
