import { DutyTally, dutyTimeLabel } from '@/lib/duty';
import { DUTY_SLOTS, DUTY_SLOT_LABELS } from '@/lib/types';

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="section-label">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums tracking-tight">
        {value}
      </p>
    </div>
  );
}

/**
 * 명세서 맨 위의 요약.
 *
 * 막대는 가장 많이 선 타임을 100 으로 두고 그린다. 총 근무 수로 나누면 다섯
 * 타임이 고르게 나뉜 만큼 전부 20% 근처에 몰려서, 어느 타임을 많이 섰는지가
 * 오히려 안 보인다.
 */
export default function DutySummary({ tally }: { tally: DutyTally }) {
  const most = Math.max(1, ...DUTY_SLOTS.map((slot) => tally.bySlot[slot]));

  return (
    <section className="rounded-lg border border-line bg-surface px-6 py-6">
      <div className="flex flex-wrap items-baseline gap-x-10 gap-y-4">
        <Figure label="선 근무" value={`${tally.total}번`} />
        <Figure label="노딱" value={`${tally.yellowDays}일`} />
        <Figure label="명근" value={`${tally.dayOffAfter}번`} />
      </div>

      <ul className="mt-6 flex flex-col gap-2">
        {DUTY_SLOTS.map((slot) => {
          const count = tally.bySlot[slot];

          return (
            <li key={slot} className="flex items-center gap-3 text-xs">
              <span className="w-8 shrink-0 text-ink-soft">
                {DUTY_SLOT_LABELS[slot]}
              </span>

              {/*
                막대는 자기 몫의 자리 안에서 늘어나야 한다. flex 줄에 바로
                두고 퍼센트를 주면 글자 칸까지 포함한 줄 전체를 기준으로 재서
                오른쪽으로 삐져나온다.
              */}
              <span className="min-w-0 flex-1" aria-hidden>
                <span
                  className="block h-1.5 rounded-full bg-accent"
                  style={{ width: `${(count / most) * 100}%` }}
                />
              </span>

              <span className="shrink-0 tabular-nums text-ink-muted">
                {count}번
              </span>

              {/* 횟수는 위 글자에 이미 있다. 낭독기에는 시각만 보탠다. */}
              <span className="sr-only">{dutyTimeLabel(slot)}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
