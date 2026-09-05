import {
  groupByYear,
  isPositive,
  periodLabel,
  summarize,
} from '@/lib/activity';
import { Activity, ACTIVITY_OUTCOME_LABELS } from '@/lib/types';

/**
 * 공모전·대외활동 지원 기록.
 *
 * 붙은 것만 적으면 몇 번 시도했는지가 사라져서 떨어진 것도 같이 둔다.
 * 다만 떨어진 항목이 눈에 먼저 들어오면 곤란하므로, 강조는 실제로 한 것에만
 * 준다. 나머지는 테두리만 있는 조용한 칩으로 남긴다.
 */
export default function ActivityList({
  activities,
}: {
  activities: Activity[];
}) {
  if (activities.length === 0) return null;

  const { applied, engaged } = summarize(activities);
  const years = groupByYear(activities);

  return (
    <section>
      <p className="text-xs tabular-nums text-ink-muted">
        지원 {applied}번 · 활동 {engaged}번
      </p>

      <div className="mt-6 flex flex-col gap-8">
        {years.map(({ year, items }) => (
          <div key={year}>
            <h3 className="section-label mb-3 tabular-nums">{year}</h3>

            <ul className="flex flex-col">
              {items.map((activity) => (
                <li
                  key={activity.id}
                  className="border-t border-line py-4 first:border-t-0 first:pt-0"
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-medium">{activity.name}</span>

                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${
                        isPositive(activity.outcome)
                          ? 'border-accent text-accent'
                          : 'border-line text-ink-muted'
                      }`}
                    >
                      {ACTIVITY_OUTCOME_LABELS[activity.outcome]}
                    </span>

                    <span className="ml-auto text-xs tabular-nums text-ink-muted">
                      {periodLabel(activity)}
                    </span>
                  </div>

                  {(activity.organizer || activity.note) && (
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {activity.organizer && (
                        <span className="text-ink-muted">
                          {activity.organizer}
                        </span>
                      )}
                      {activity.organizer && activity.note && (
                        <span className="mx-2 text-ink-muted opacity-50">
                          ·
                        </span>
                      )}
                      {activity.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
