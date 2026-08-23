import type { Trouble } from '@/lib/projects';

const STEPS: { key: keyof Trouble; label: string }[] = [
  { key: 'problem', label: '문제' },
  { key: 'cause', label: '원인' },
  { key: 'tried', label: '시도' },
  { key: 'solution', label: '해결' },
];

/** 문제 → 원인 → 시도 → 해결 → 성과를 한 덩어리로 보여줘요. */
export default function TroubleCard({
  trouble,
  index,
}: {
  trouble: Trouble;
  index: number;
}) {
  return (
    <article className="rounded-lg border border-line p-6 sm:p-8">
      <div className="flex items-baseline gap-3">
        <span className="text-xs tabular-nums text-ink-muted">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="text-lg font-bold leading-snug tracking-tight">
          {trouble.title}
        </h3>
      </div>

      <dl className="mt-6 flex flex-col gap-4">
        {STEPS.map(({ key, label }) => (
          <div key={key} className="sm:flex sm:gap-6">
            <dt className="w-12 shrink-0 text-xs leading-relaxed text-ink-muted">
              {label}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-ink-soft sm:mt-0">
              {trouble[key]}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 border-t border-line pt-5 sm:flex sm:gap-6">
        <p className="w-12 shrink-0 text-xs leading-relaxed text-accent">
          성과
        </p>
        <p className="mt-1 text-sm font-medium leading-relaxed text-ink sm:mt-0">
          {trouble.result}
        </p>
      </div>
    </article>
  );
}
