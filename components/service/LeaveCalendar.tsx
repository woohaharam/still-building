'use client';

import { useMemo, useState } from 'react';
import { buildMonthMatrix, isSameMonth, toDateKey } from '@/lib/calendar';
import { buildLeaveIndex } from '@/lib/leave-dates';
import { Leave, LEAVE_KINDS, LEAVE_KIND_LABELS, LeaveKind } from '@/lib/types';

/**
 * 종류별 색. 값 자체는 globals.css 의 CSS 변수에 있어서 다크 모드에서
 * 알아서 바뀐다. 여기서는 어느 클래스를 붙일지만 정한다.
 *
 * 칸은 옅게 깔고 점과 글자는 진하게 쓴다. 글자색을 바꾸지 않기 때문에
 * 본문 대비가 흔들리지 않는다.
 */
const KIND_STYLE: Record<LeaveKind, { cell: string; dot: string }> = {
  outing: { cell: 'bg-leave-outing/15', dot: 'bg-leave-outing' },
  overnight: { cell: 'bg-leave-overnight/15', dot: 'bg-leave-overnight' },
  leave: { cell: 'bg-leave-leave/15', dot: 'bg-leave-leave' },
  final: { cell: 'bg-leave-final/15', dot: 'bg-leave-final' },
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function LeaveCalendar({ leaves }: { leaves: Leave[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const index = useMemo(() => buildLeaveIndex(leaves), [leaves]);
  const days = useMemo(() => buildMonthMatrix(year, month), [year, month]);
  const todayKey = toDateKey(today);

  function move(step: number) {
    const next = new Date(year, month + step, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tabular-nums">
          {year}년 {month + 1}월
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => move(-1)}
            aria-label="이전 달"
            className="rounded-md px-3 py-1.5 text-sm text-ink-muted transition-colors hover:bg-surface hover:text-ink"
          >
            ‹
          </button>
          <button
            onClick={() => {
              setYear(today.getFullYear());
              setMonth(today.getMonth());
            }}
            className="rounded-md px-3 py-1.5 text-xs text-ink-muted transition-colors hover:bg-surface hover:text-ink"
          >
            오늘
          </button>
          <button
            onClick={() => move(1)}
            aria-label="다음 달"
            className="rounded-md px-3 py-1.5 text-sm text-ink-muted transition-colors hover:bg-surface hover:text-ink"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((label) => (
          <div
            key={label}
            className="pb-1 text-center text-xs text-ink-muted"
            aria-hidden
          >
            {label}
          </div>
        ))}

        {days.map((date) => {
          const key = toDateKey(date);
          const inMonth = isSameMonth(date, year, month);
          const leave = index.get(key);
          const style = leave ? KIND_STYLE[leave.kind] : null;

          return (
            <div
              key={key}
              className={`flex min-h-[3.5rem] flex-col items-center justify-center gap-1 rounded-md border text-sm tabular-nums ${
                style ? style.cell : ''
              } ${
                key === todayKey
                  ? 'border-ink-muted font-semibold'
                  : 'border-transparent'
              } ${inMonth ? '' : 'opacity-30'}`}
            >
              <span>{date.getDate()}</span>
              {leave && (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${style!.dot}`}
                  title={LEAVE_KIND_LABELS[leave.kind]}
                />
              )}
              <span className="sr-only">
                {leave ? LEAVE_KIND_LABELS[leave.kind] : ''}
              </span>
            </div>
          );
        })}
      </div>

      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-soft">
        {LEAVE_KINDS.map((kind) => (
          <li key={kind} className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${KIND_STYLE[kind].dot}`}
              aria-hidden
            />
            {LEAVE_KIND_LABELS[kind]}
          </li>
        ))}
      </ul>
    </section>
  );
}
