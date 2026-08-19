'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CalendarEvent,
  EVENT_KIND_LABELS,
  EventKind,
  Post,
  TAG_LABELS,
} from '@/lib/types';
import {
  DateKey,
  buildDayIndex,
  buildMonthMatrix,
  formatDayLabel,
  isSameMonth,
  toDateKey,
} from '@/lib/calendar';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const KIND_DOT: Record<EventKind, string> = {
  plan: 'bg-accent',
  deadline: 'border border-accent bg-paper',
  note: 'bg-ink-muted',
};

function Dot({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${className}`}
    />
  );
}

function PostMark({ className = '' }: { className?: string }) {
  // 글은 일정과 구분되게 동그라미 대신 네모로 표시해요.
  return (
    <span className={`inline-block h-1.5 w-1.5 shrink-0 bg-ink ${className}`} />
  );
}

interface CalendarProps {
  posts: Post[];
  events: CalendarEvent[];
}

export default function Calendar({ posts, events }: CalendarProps) {
  // 서버(UTC)와 브라우저의 '오늘'이 다를 수 있어서 날짜 기준은 마운트 후에 잡아요.
  const [mounted, setMounted] = useState(false);
  const [todayKey, setTodayKey] = useState<DateKey>('');
  const [cursor, setCursor] = useState({ year: 1970, month: 0 });
  const [selected, setSelected] = useState<DateKey>('');

  useEffect(() => {
    const now = new Date();
    setTodayKey(toDateKey(now));
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
    setSelected(toDateKey(now));
    setMounted(true);
  }, []);

  const index = useMemo(() => buildDayIndex(posts, events), [posts, events]);
  const days = useMemo(
    () => buildMonthMatrix(cursor.year, cursor.month),
    [cursor]
  );

  const monthSummary = useMemo(() => {
    let postCount = 0;
    const eventIds = new Set<string>();
    days.forEach((day) => {
      if (!isSameMonth(day, cursor.year, cursor.month)) return;
      const entry = index.get(toDateKey(day));
      if (!entry) return;
      postCount += entry.posts.length;
      entry.events.forEach((e) => eventIds.add(e.id));
    });
    return { postCount, eventCount: eventIds.size };
  }, [days, index, cursor]);

  function moveMonth(delta: number) {
    setCursor(({ year, month }) => {
      const next = new Date(year, month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  function goToday() {
    const now = new Date();
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
    setSelected(toDateKey(now));
  }

  function selectDay(day: Date) {
    setSelected(toDateKey(day));
    if (!isSameMonth(day, cursor.year, cursor.month)) {
      setCursor({ year: day.getFullYear(), month: day.getMonth() });
    }
  }

  if (!mounted) {
    // 마운트 전에는 같은 크기의 빈 틀만 그려서 화면이 튀지 않게 해요.
    return <div className="min-h-[560px]" aria-hidden />;
  }

  const selectedEntry = index.get(selected);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => moveMonth(-1)}
            aria-label="이전 달"
            className="h-8 w-8 rounded-md border border-line text-ink-soft hover:border-ink-muted transition-colors"
          >
            ‹
          </button>
          <h2 className="text-lg font-semibold tabular-nums">
            {cursor.year}년 {cursor.month + 1}월
          </h2>
          <button
            onClick={() => moveMonth(1)}
            aria-label="다음 달"
            className="h-8 w-8 rounded-md border border-line text-ink-soft hover:border-ink-muted transition-colors"
          >
            ›
          </button>
        </div>
        <button
          onClick={goToday}
          className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-ink-muted transition-colors"
        >
          오늘
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <Dot className={KIND_DOT.plan} /> 일정
        </span>
        <span className="flex items-center gap-1.5">
          <Dot className={KIND_DOT.deadline} /> 마감
        </span>
        <span className="flex items-center gap-1.5">
          <Dot className={KIND_DOT.note} /> 메모
        </span>
        <span className="flex items-center gap-1.5">
          <PostMark /> 쓴 글
        </span>
        <span className="ml-auto tabular-nums">
          이번 달 일정 {monthSummary.eventCount} · 글 {monthSummary.postCount}
        </span>
      </div>

      <div>
        <div className="grid grid-cols-7 border-b border-line pb-2 text-center text-xs text-ink-muted">
          {WEEKDAYS.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 border-l border-line">
          {days.map((day) => {
            const key = toDateKey(day);
            const entry = index.get(key);
            const inMonth = isSameMonth(day, cursor.year, cursor.month);
            const isToday = key === todayKey;
            const isSelected = key === selected;
            const items = [
              ...(entry?.events ?? []).map((e) => ({
                id: `e-${e.id}`,
                label: e.title,
                dot: KIND_DOT[e.kind],
              })),
              ...(entry?.posts ?? []).map((p) => ({
                id: `p-${p.id}`,
                label: p.title,
                dot: '',
              })),
            ];

            return (
              <button
                key={key}
                onClick={() => selectDay(day)}
                aria-pressed={isSelected}
                className={`flex min-h-[76px] flex-col gap-1 border-b border-r border-line p-1.5 text-left transition-colors sm:min-h-[92px] [&:nth-child(7n)]:border-r-0 ${
                  isSelected ? 'bg-[#F0F0EC]' : 'hover:bg-[#F4F4F0]'
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs tabular-nums ${
                    isToday ? 'bg-ink text-paper font-semibold' : ''
                  } ${inMonth ? 'text-ink' : 'text-ink-muted/60'}`}
                >
                  {day.getDate()}
                </span>

                {items.length > 0 && (
                  <>
                    {/* 좁은 화면에서는 점만, 넓은 화면에서는 제목까지 */}
                    <span className="flex flex-wrap gap-1 sm:hidden">
                      {items.slice(0, 4).map((item) =>
                        item.dot ? (
                          <Dot key={item.id} className={item.dot} />
                        ) : (
                          <PostMark key={item.id} />
                        )
                      )}
                    </span>

                    <span className="hidden flex-col gap-0.5 sm:flex">
                      {items.slice(0, 2).map((item) => (
                        <span
                          key={item.id}
                          className={`flex items-center gap-1 text-[11px] leading-tight ${
                            inMonth ? 'text-ink-soft' : 'text-ink-muted/60'
                          }`}
                        >
                          {item.dot ? <Dot className={item.dot} /> : <PostMark />}
                          <span className="truncate">{item.label}</span>
                        </span>
                      ))}
                      {items.length > 2 && (
                        <span className="text-[11px] leading-tight text-ink-muted">
                          +{items.length - 2}
                        </span>
                      )}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="text-sm font-semibold">{formatDayLabel(selected)}</h3>

        {!selectedEntry ? (
          <p className="mt-4 text-sm text-ink-muted">
            이 날에는 기록된 일정도, 쓴 글도 없어요.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-5">
            {selectedEntry.events.length > 0 && (
              <ul className="flex flex-col gap-3">
                {selectedEntry.events.map((event) => (
                  <li key={event.id} className="flex gap-2.5">
                    <Dot className={`mt-1.5 ${KIND_DOT[event.kind]}`} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="text-sm font-medium">{event.title}</span>
                        <span className="text-xs text-ink-muted">
                          {EVENT_KIND_LABELS[event.kind]}
                          {event.start_time ? ` · ${event.start_time}` : ''}
                          {event.end_date && event.end_date > event.start_date
                            ? ` · ~${event.end_date}`
                            : ''}
                        </span>
                      </div>
                      {event.description && (
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {selectedEntry.posts.length > 0 && (
              <ul className="flex flex-col gap-3">
                {selectedEntry.posts.map((post) => (
                  <li key={post.id} className="flex gap-2.5">
                    <PostMark className="mt-1.5" />
                    <div className="min-w-0">
                      <Link
                        href={`/posts/${post.slug}`}
                        className="text-sm font-medium hover:text-accent transition-colors"
                      >
                        {post.title}
                      </Link>
                      <div className="mt-1 flex items-center gap-3 text-xs text-ink-muted">
                        <span>이 날 쓴 글</span>
                        {post.tags?.map((t) => <span key={t}>#{TAG_LABELS[t]}</span>)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
