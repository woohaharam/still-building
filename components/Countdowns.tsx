import Link from 'next/link';
import { Countdown, ddayLabel, isSoon } from '@/lib/dday';
import { formatDayLabel } from '@/lib/calendar';
import { eventKindLabel } from '@/lib/types';

/**
 * 메인 화면의 남은 날.
 *
 * 남은 날이 먼저 읽히도록 오른쪽 끝에 크게 둔다. 제목은 그게 무엇인지 알려주는
 * 말이지, 세고 있는 값은 아니다.
 *
 * 띄울 게 없으면 통째로 빠진다. 빈 칸에 '일정이 없어요' 를 적어두면 메인에
 * 아무 말도 하지 않는 자리가 하나 생긴다.
 */
export default function Countdowns({ items }: { items: Countdown[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="countdowns-heading">
      <h2 id="countdowns-heading" className="section-label mb-4">
        다가오는 날
      </h2>

      <ul className="flex flex-col">
        {items.map(({ event, days, ongoing }) => {
          const kind = eventKindLabel(event.kind);
          const soon = isSoon({ event, days, ongoing });

          return (
            <li
              key={event.id}
              className="flex items-baseline gap-4 border-t border-line py-4 last:border-b"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">
                  {event.title}
                </span>
                <span className="mt-1 block text-xs text-ink-muted">
                  {kind && <span className="mr-2">{kind}</span>}

                  {/*
                    진행 중이면 시작일 대신 끝나는 날을 적는다. 이미 지난
                    날짜를 그대로 두면 끝난 일처럼 보인다.
                  */}
                  {ongoing && event.end_date ? (
                    <span className="tabular-nums">
                      {formatDayLabel(event.end_date)}까지
                    </span>
                  ) : (
                    <>
                      <span className="tabular-nums">
                        {formatDayLabel(event.start_date)}
                      </span>
                      {event.start_time && (
                        <span className="ml-1.5 tabular-nums">
                          {event.start_time}
                        </span>
                      )}
                    </>
                  )}
                </span>
              </span>

              <span
                className={`shrink-0 text-lg font-bold tabular-nums tracking-tight ${
                  soon ? 'text-accent' : 'text-ink-soft'
                }`}
              >
                {ongoing ? '진행 중' : ddayLabel(days)}
              </span>
            </li>
          );
        })}
      </ul>

      <Link
        href="/calendar"
        className="mt-4 inline-block text-xs text-ink-muted underline-offset-4 hover:text-ink-soft hover:underline"
      >
        전체 일정 보기 →
      </Link>
    </section>
  );
}
