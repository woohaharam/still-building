'use client';

import { ACTIONS, type Action } from '@/lib/markdown-format';

/**
 * 본문 편집기 위에 붙는 서식 버튼.
 * 마크다운을 외우지 않아도 제목 크기와 글자 두께를 바꿀 수 있게 하는 게 목적이다.
 * 실제 계산은 lib/markdown-format.ts 가 합니다.
 */
export default function MarkdownToolbar({
  onAction,
  disabled,
}: {
  onAction: (action: Action) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-md border border-line px-2 py-1.5">
      {ACTIONS.map((action, i) =>
        action === 'divider' ? (
          <span
            key={`divider-${i}`}
            aria-hidden
            className="mx-1 h-4 w-px bg-line"
          />
        ) : (
          <button
            key={action.label}
            type="button"
            title={action.title}
            disabled={disabled}
            onClick={() => onAction(action)}
            className="rounded px-2 py-1 text-xs text-ink-soft transition-colors hover:bg-surface hover:text-ink disabled:opacity-40"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
