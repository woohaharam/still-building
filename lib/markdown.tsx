import type { Components } from 'react-markdown';
import CodeBlock from '@/components/CodeBlock';
import { imageSizeClass, isImageSize } from './image-size';

/**
 * 글 본문과 관리자 미리보기가 같이 쓰는 렌더링 규칙.
 * 한쪽에만 손대면 미리보기와 실제가 달라지기 때문에 한곳에 뒀다.
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
        // 크기로 읽은 값은 말풍선으로 새지 않게 지운다.
        title={isImageSize(title) ? undefined : title}
        loading="lazy"
        className={`rounded-lg ${imageSizeClass(title)}`}
      />
    );
  },
};
