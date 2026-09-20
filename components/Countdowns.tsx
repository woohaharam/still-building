import Link from 'next/link';
import { formatDate } from '@/lib/calendar';
import { Countdown, ddayLabel, isSoon } from '@/lib/dday';

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
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-baseline gap-4 border-t border-line py-4 last:border-b"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{item.title}</span>
              <span className="mt-1 block text-xs text-ink-muted">
                {item.label && <span className="mr-2">{item.label}</span>}

                {/*
                  진행 중이면 시작일 대신 끝나는 날을 적는다. 이미 지난
                  날짜를 그대로 두면 끝난 일처럼 보인다.
                */}
                {item.ongoing && item.endsOn ? (
                  <span className="tabular-nums">
                    {formatDate(item.endsOn)}까지
                  </span>
                ) : (
                  <>
                    <span className="tabular-nums">
                      {formatDate(item.startsOn)}
                    </span>
                    {item.time && (
                      <span className="ml-1.5 tabular-nums">{item.time}</span>
                    )}
                  </>
                )}
              </span>
            </span>

            <span
              className={`shrink-0 text-lg font-bold tabular-nums tracking-tight ${
                isSoon(item) ? 'text-accent' : 'text-ink-soft'
              }`}
            >
              {item.ongoing ? '진행 중' : ddayLabel(item.days)}
            </span>
          </li>
        ))}
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
