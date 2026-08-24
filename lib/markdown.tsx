import type { Components } from 'react-markdown';
import CodeBlock from '@/components/CodeBlock';

/**
 * 본문 이미지 크기.
 *
 * 마크다운 표준 문법인 제목(title)을 크기 이름으로 씁니다.
 * ![설명](주소 "small") 처럼요. 새 문법을 만들지 않아도 되고,
 * 다른 마크다운 뷰어에서 열어도 그냥 제목으로 읽혀서 깨지지 않아요.
 */
export const IMAGE_SIZES = {
  small: { label: '작게', className: 'mx-auto block max-w-xs' },
  medium: { label: '중간', className: 'mx-auto block max-w-md' },
  large: { label: '크게', className: 'block max-w-full' },
} as const;

export type ImageSize = keyof typeof IMAGE_SIZES;

export const IMAGE_SIZE_KEYS = Object.keys(IMAGE_SIZES) as ImageSize[];

function sizeClass(title?: string) {
  if (title && title in IMAGE_SIZES) {
    return IMAGE_SIZES[title as ImageSize].className;
  }
  return IMAGE_SIZES.large.className;
}

/**
 * 글 본문과 관리자 미리보기가 같이 쓰는 렌더링 규칙.
 * 한쪽에만 손대면 "미리보기와 실제가 다른" 문제가 생겨서 한곳에 뒀어요.
 */
export const markdownComponents: Components = {
  pre: CodeBlock,
  img({ src, alt, title }) {
    if (!src) return null;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt || ''}
        // 제목을 크기 이름으로 쓰기 때문에 그대로 두면 마우스를 올릴 때
        // "small" 같은 말풍선이 떠요. 크기로 해석한 값은 지웁니다.
        title={title && title in IMAGE_SIZES ? undefined : title}
        loading="lazy"
        className={`rounded-lg ${sizeClass(title)}`}
      />
    );
  },
};
