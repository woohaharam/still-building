import type { Metadata } from 'next';
import Container from '@/components/Container';
import DischargeCounter from '@/components/service/DischargeCounter';
import LeaveCalendar from '@/components/service/LeaveCalendar';
import { toDateKey } from '@/lib/calendar';
import { formatDate } from '@/lib/date';
import { upcomingLeaves } from '@/lib/leave-dates';
import { getLeaves } from '@/lib/leaves';
import { serviceStatus } from '@/lib/service';
import { siteUrl } from '@/lib/site';
import { LEAVE_KIND_LABELS } from '@/lib/types';

export const revalidate = 0;

export const metadata: Metadata = {
  title: '복무 기록',
  description: '전역까지 남은 날과 나가는 날들.',
  alternates: { canonical: `${siteUrl}/service` },
};

export default async function ServicePage() {
  const leaves = await getLeaves();
  const today = toDateKey(new Date());
  const status = serviceStatus(today);
  const upcoming = upcomingLeaves(leaves, today).slice(0, 5);

  return (
    <Container>
      <div className="flex flex-col gap-10">
        <section>
          <h1 className="text-2xl font-bold leading-snug">복무 기록</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            전역까지 남은 날과, 언제 나가는지 세어두는 곳이에요.
          </p>
        </section>

        <DischargeCounter status={status} />

        <LeaveCalendar leaves={leaves} />

        <section>
          <h2 className="section-label mb-4">다음 일정</h2>

          {upcoming.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-muted">
              아직 잡아둔 일정이 없어요.
            </p>
          ) : (
            <ul className="flex flex-col">
              {upcoming.map((leave) => (
                <li
                  key={leave.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line py-3 first:pt-0 last:border-b-0"
                >
                  <span className="text-sm font-medium">
                    {LEAVE_KIND_LABELS[leave.kind]}
                    {leave.note && (
                      <span className="ml-2 font-normal text-ink-soft">
                        {leave.note}
                      </span>
                    )}
                  </span>
                  <span className="text-xs tabular-nums text-ink-muted">
                    {formatDate(leave.started_on)}
                    {leave.ended_on && leave.ended_on !== leave.started_on && (
                      <> — {formatDate(leave.ended_on)}</>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Container>
  );
}
