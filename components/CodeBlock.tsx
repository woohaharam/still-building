'use client';

import {
  Children,
  isValidElement,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactElement,
} from 'react';

/**
 * 글 본문의 코드 블록. 위에 얇은 바를 붙여서 언어 이름과 복사 버튼을 보여줘요.
 * ReactMarkdown의 `pre` 자리에 그대로 끼워 씁니다.
 */
export default function CodeBlock({
  children,
  ...props
}: ComponentPropsWithoutRef<'pre'>) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  // ```ts 처럼 적으면 안쪽 <code>에 language-ts 클래스가 붙어요.
  const codeChild = Children.toArray(children).find(isValidElement) as
    | ReactElement<{ className?: string }>
    | undefined;
  const language =
    codeChild?.props?.className?.match(/language-([\w+#.-]+)/)?.[1] ?? '';

  async function handleCopy() {
    const text = preRef.current?.textContent ?? '';
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setFailed(false);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // http나 오래된 브라우저에서는 클립보드가 막혀 있어요.
      setFailed(true);
      setTimeout(() => setFailed(false), 2400);
    }
  }

  return (
    <div className="code-block">
      <div className="code-block__bar">
        <span className="code-block__lang">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="code-block__copy"
          aria-label="코드 복사"
        >
          {failed ? '복사 실패' : copied ? '복사됨' : '복사'}
        </button>
      </div>
      <pre ref={preRef} {...props}>
        {children}
      </pre>
    </div>
  );
}
