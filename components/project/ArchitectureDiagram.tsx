import type { Architecture } from '@/lib/projects';

/**
 * 시스템 구조도. 라이브러리 없이 CSS만으로 그린다.
 * 넓은 화면에서는 칸이 가로로, 좁은 화면에서는 세로로 이어진다.
 */
export default function ArchitectureDiagram({
  architecture,
}: {
  architecture: Architecture;
}) {
  const { caption, columns, flows } = architecture;

  return (
    <figure className="m-0">
      <div className="overflow-x-auto">
        <div className="flex min-w-full flex-col gap-3 md:flex-row md:items-stretch">
          {columns.map((column, i) => (
            <div key={column.title} className="flex flex-1 md:items-stretch">
              <div className="flex-1 rounded-lg border border-line bg-surface/60 p-4">
                <p className="text-[11px] tracking-[0.16em] text-ink-muted">
                  {column.title.toUpperCase()}
                </p>
                <ul className="mt-3 flex flex-col gap-2">
                  {column.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-md border border-line bg-paper px-3 py-2 text-xs leading-relaxed text-ink-soft"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 칸 사이의 화살표. 마지막 칸 뒤에는 붙이지 않아요. */}
              {i < columns.length - 1 && (
                <span
                  aria-hidden
                  className="flex shrink-0 items-center justify-center px-1 text-ink-muted md:px-2"
                >
                  <span className="md:hidden">↓</span>
                  <span className="hidden md:inline">→</span>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <figcaption className="mt-5 text-sm leading-relaxed text-ink-soft">
        {caption}
      </figcaption>

      <ul className="mt-5 flex flex-col gap-2 border-t border-line pt-5">
        {flows.map((flow) => (
          <li key={flow} className="text-xs leading-relaxed text-ink-muted">
            {flow}
          </li>
        ))}
      </ul>
    </figure>
  );
}
