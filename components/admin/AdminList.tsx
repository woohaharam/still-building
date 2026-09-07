import type { ReactNode } from 'react';

/**
 * 관리자 화면 오른쪽에 붙는 목록.
 *
 * 독후감·여행·복무·활동 네 곳이 같은 껍데기를 각각 들고 있었다. 불러오는 중,
 * 비어 있음, 항목마다 수정·삭제 — 글자까지 같고 항목 안에 무엇을 적는지만
 * 달랐다. 껍데기를 여기로 옮기고 달랐던 부분만 넘겨받는다.
 *
 * 저장·삭제 자체는 lib/use-admin-collection.ts 가 맡는다. 이건 화면만 그린다.
 */
export default function AdminList<T extends { id: string }>({
  title,
  items,
  loading,
  onEdit,
  onRemove,
  children,
}: {
  /** '독후감 3편' 처럼 개수까지 넣은 제목. */
  title: string;
  items: T[];
  loading: boolean;
  onEdit: (item: T) => void;
  onRemove: (item: T) => void;
  /** 항목 하나를 어떻게 적을지. 수정·삭제 줄은 이 밑에 저절로 붙는다. */
  children: (item: T) => ReactNode;
}) {
  return (
    <aside>
      <h2 className="mb-4 text-sm text-ink-muted">{title}</h2>

      {loading ? (
        <p className="text-sm text-ink-muted">불러오는 중...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-ink-muted">아직 없어요.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="border-b border-line pb-3 last:border-b-0"
            >
              {children(item)}

              <div className="mt-2 flex gap-3 text-xs">
                <button
                  onClick={() => onEdit(item)}
                  className="text-ink-soft underline hover:text-ink"
                >
                  수정
                </button>
                <button
                  onClick={() => onRemove(item)}
                  className="text-danger underline hover:opacity-80"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
