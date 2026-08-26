'use client';

import { useState } from 'react';
import { Heading } from '@/lib/toc';

/** 글이 짧으면 목차가 오히려 방해라, 제목이 셋 이상일 때만 보여준다. */
export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [open, setOpen] = useState(true);

  if (headings.length < 3) return null;

  return (
    <nav
      aria-label="목차"
      className="mb-10 rounded-lg border border-line bg-surface/60 px-5 py-4"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-xs tracking-[0.18em] text-ink-muted">목차</span>
        <span className="text-xs text-ink-muted">
          {open ? '접기' : '펼치기'}
        </span>
      </button>

      {open && (
        <ol className="mt-3 flex flex-col gap-2">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={heading.level === 3 ? 'pl-4' : undefined}
            >
              <a
                href={`#${heading.id}`}
                className="text-sm leading-snug text-ink-soft transition-colors hover:text-accent"
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}
