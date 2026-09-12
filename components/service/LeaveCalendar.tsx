'use client';

import { useMemo, useState } from 'react';
import { buildMonthMatrix, isSameMonth, toDateKey } from '@/lib/calendar';
import { buildLeaveIndex } from '@/lib/leave-dates';
import { SERVICE } from '@/lib/service';
import { Leave, LEAVE_KINDS, LEAVE_KIND_LABELS, LeaveKind } from '@/lib/types';

/**
 * 종류별 색. 값 자체는 globals.css 의 CSS 변수에 있어서 다크 모드에서
 * 알아서 바뀐다. 여기서는 어느 클래스를 붙일지만 정한다.
 *
 * 칸은 옅게 깔고 점과 글자는 진하게 쓴다. 글자색을 바꾸지 않기 때문에
 * 본문 대비가 흔들리지 않는다.
 *
 * 지난달·다음달 날짜는 예전에 칸 전체를 opacity-30 으로 눌렀는데, 그러면 날짜
 * 숫자가 대비 1.9:1 이 된다. 흐리게 보이는 것과 못 읽는 것은 다르다. 지금은
 * 글자를 --ink-muted 로 낮추고(5.0:1) 배경 색만 옅게 남긴다.
 */
const KIND_STYLE: Record<LeaveKind, { cell: string; dot: string }> = {
  outing: { cell: 'bg-leave-outing/15', dot: 'bg-leave-outing' },
  special_outing: { cell: 'bg-leave-special/15', dot: 'bg-leave-special' },
  leave: { cell: 'bg-leave-leave/15', dot: 'bg-leave-leave' },
  final: { cell: 'bg-leave-final/15', dot: 'bg-leave-final' },
  off: { cell: 'bg-leave-off/15', dot: 'bg-leave-off' },
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** 지금 보고 있는 달. */
interface Cursor {
  year: number;
  month: number;
}

function monthOf(date: Date): Cursor {
  return { year: date.getFullYear(), month: date.getMonth() };
}

export default function LeaveCalendar({ leaves }: { leaves: Leave[] }) {
  const today = new Date();

  /*
    연·월을 각각 useState 로 두면 move 가 화면에 그려진 값을 읽는다. 그러면
    한 번 그려지기 전에 화살표를 여러 번 누를 때 전부 같은 달을 계산해서
    한 달만 넘어간다. 하나로 묶고 이전 값을 받아 계산한다.
  */
  const [cursor, setCursor] = useState(() => monthOf(today));
  const { year, month } = cursor;

  const index = useMemo(() => buildLeaveIndex(leaves), [leaves]);
  const days = useMemo(() => buildMonthMatrix(year, month), [year, month]);
  const todayKey = toDateKey(today);

  function move(step: number) {
    setCursor((prev) => monthOf(new Date(prev.year, prev.month + step, 1)));
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
            onClick={() => setCursor(monthOf(new Date()))}
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

          /*
            전역일은 적어두는 게 아니라 lib/service.ts 의 날짜에서 바로 온다.
            그날 말출이 걸쳐 있어도 전역이 이긴다. 달력에서 제일 중요한 칸이다.
          */
          const discharge = key === SERVICE.dischargeOn;
          const leave = discharge ? undefined : index.get(key);
          const style = leave ? KIND_STYLE[leave.kind] : null;

          return (
            <div
              key={key}
              className={`flex min-h-[3.5rem] flex-col items-center justify-center gap-1 rounded-md border text-sm tabular-nums ${
                discharge
                  ? 'border-transparent bg-leave-discharge-fill font-bold text-white'
                  : `${style ? (inMonth ? style.cell : `${style.cell} opacity-40`) : ''} ${
                      key === todayKey
                        ? 'border-ink-muted font-semibold'
                        : 'border-transparent'
                    }`
              } ${inMonth ? '' : 'text-ink-muted'}`}
            >
              <span>{date.getDate()}</span>

              {discharge ? (
                <span className="text-[10px] font-bold leading-none tracking-tight">
                  전역
                </span>
              ) : leave ? (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${style!.dot}`}
                  title={LEAVE_KIND_LABELS[leave.kind]}
                />
              ) : null}

              <span className="sr-only">
                {discharge
                  ? '전역일'
                  : leave
                    ? LEAVE_KIND_LABELS[leave.kind]
                    : ''}
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

        {/* 전역만 점이 아니라 칠한 칸이라, 범례도 칸 모양으로 둔다. */}
        <li className="flex items-center gap-2 font-semibold text-leave-discharge">
          <span
            className="h-2.5 w-2.5 rounded-sm bg-leave-discharge-fill"
            aria-hidden
          />
          전역
        </li>
      </ul>
    </section>
  );
}
