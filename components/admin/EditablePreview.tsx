'use client';

import { useMemo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { IMAGE_SIZES, IMAGE_SIZE_KEYS, imageSizeClass } from '@/lib/image-size';
import { imageIndexAt } from '@/lib/markdown-image';
import { markdownComponents } from '@/lib/markdown';
import type { ImageSize } from '@/lib/image-size';

/**
 * 쓰면서 바로 보는 본문. 사진은 여기서 크기를 바꾼다.
 *
 * 글에 보이는 모습 그대로여야 하므로 markdownComponents 를 그대로 쓰고
 * 사진만 덧씌운다. 미리보기 전용으로 따로 그리면 둘이 조금씩 달라진다.
 *
 * 몇 번째 사진인지는 react-markdown 이 알려주는 원본 위치로 되짚는다.
 * 그려진 순서로 세면 같은 주소의 사진이 여러 장일 때 어긋난다.
 */
export default function EditablePreview({
  content,
  onResize,
  onMask,
}: {
  content: string;
  onResize: (index: number, size: ImageSize) => void;
  onMask?: (index: number) => void;
}) {
  const components: Components = useMemo(
    () => ({
      ...markdownComponents,
      img({ src, alt, title, node }) {
        // react-markdown 의 src 는 Blob 도 될 수 있는 타입이다. 우리가 넣는
        // 것은 늘 주소라서, 주소가 아니면 그리지 않는다.
        if (typeof src !== 'string' || !src) return null;

        const offset = node?.position?.start?.offset;
        const index = offset === undefined ? -1 : imageIndexAt(content, offset);

        return (
          <span className="group relative inline-block w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt || ''}
              className={`rounded-lg ${imageSizeClass(
                typeof title === 'string' ? title : undefined
              )}`}
            />

            {index >= 0 && (
              <span className="pointer-events-none absolute left-2 top-2 flex gap-1 opacity-0 transition-opacity group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
                {IMAGE_SIZE_KEYS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onResize(index, size)}
                    className="rounded bg-ink/80 px-2 py-1 text-[11px] text-paper hover:bg-ink"
                  >
                    {IMAGE_SIZES[size].label}
                  </button>
                ))}
                {onMask && (
                  <button
                    type="button"
                    onClick={() => onMask(index)}
                    className="rounded bg-ink/80 px-2 py-1 text-[11px] text-paper hover:bg-ink"
                  >
                    가리기
                  </button>
                )}
              </span>
            )}
          </span>
        );
      },
    }),
    [content, onResize, onMask]
  );

  return (
    <div className="prose-post min-h-[300px] overflow-auto rounded-md border border-line px-4 py-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }]]}
        components={components}
      >
        {content || '_내용이 없어요._'}
      </ReactMarkdown>
    </div>
  );
}
