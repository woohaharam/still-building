import { formatDate } from '@/lib/date';
import { SERVICE, ServiceStatus, dDayLabel } from '@/lib/service';

/** 전역까지 얼마나 남았는지. 이 페이지에서 제일 먼저 보이는 칸이다. */
export default function DischargeCounter({
  status,
}: {
  status: ServiceStatus;
}) {
  return (
    <section className="rounded-lg border border-line bg-surface px-6 py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="section-label">{SERVICE.branch} · 전역까지</p>
        <p className="text-2xl font-bold tabular-nums tracking-tight">
          {dDayLabel(status)}
        </p>
      </div>

      <div
        className="mt-5 h-2 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={Math.round(status.percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="복무 진행률"
      >
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${status.percent}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs text-ink-muted">
        <span className="tabular-nums">
          {status.servedDays} / {status.totalDays}일
        </span>
        <span className="tabular-nums">{status.percent.toFixed(1)}%</span>
        <span>{formatDate(SERVICE.dischargeOn)} 전역</span>
      </div>
    </section>
  );
}
