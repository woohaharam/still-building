import { formatMonthLabel, formatShortDay } from '@/lib/calendar';
import {
  DutyRow,
  crossesMidnight,
  dutyTimeLabel,
  groupDutiesByMonth,
} from '@/lib/duty';
import { DUTY_SLOT_LABELS } from '@/lib/types';

/**
 * 근무 명세서 본체.
 *
 * 달마다 표를 하나씩 세운다. 한 표에 다 몰아넣으면 제목 줄이 스크롤 밖으로
 * 사라져서, 지금 보는 줄이 몇 월인지 알 수 없다.
 *
 * 시간 칸은 좁은 화면에서 접는다. 타임 이름을 알면 시각도 아는 것이라
 * (오전이 08-13 인 건 안 바뀐다) 좁은 데서 제일 먼저 양보할 칸이다.
 */
/*
  줄 안의 작은 글씨는 --ink-muted 를 쓰지 않는다.

  그 색은 --surface 위에서 4.5:1 을 겨우 넘기게 맞춰둔 값인데, 노딱 줄은
  그보다 진한 노란 칸이라 거기서 4.13:1 로 떨어진다. axe 로 훑다가 나왔다.
  한 단계 진한 --ink-soft 는 종이·카드·노란 칸 어디서나 넘긴다(5.9:1 이상).
*/
export default function DutySheet({ rows }: { rows: DutyRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-ink-muted">
        아직 적어둔 근무가 없어요.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {groupDutiesByMonth(rows).map(({ month, rows: monthRows }) => (
        <section key={month}>
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <h2 className="section-label tabular-nums">
              {formatMonthLabel(month)}
            </h2>
            <span className="text-xs tabular-nums text-ink-muted">
              {monthRows.length}번
            </span>
          </div>

          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">
              {formatMonthLabel(month)} 근무 기록
            </caption>

            <thead>
              <tr className="border-b border-line text-left text-xs text-ink-muted">
                <th scope="col" className="py-2 pr-3 font-normal">
                  날짜
                </th>
                <th scope="col" className="py-2 pr-3 font-normal">
                  타임
                </th>
                <th
                  scope="col"
                  className="hidden py-2 pr-3 font-normal sm:table-cell"
                >
                  시간
                </th>
                <th scope="col" className="py-2 text-right font-normal">
                  조
                </th>
              </tr>
            </thead>

            <tbody>
              {monthRows.map(({ duty, jo, yellow }) => (
                <tr
                  key={duty.id}
                  className={`border-b border-line last:border-b-0 ${
                    yellow ? 'bg-duty-yellow/15' : ''
                  }`}
                >
                  <th
                    scope="row"
                    className="py-2.5 pr-3 text-left font-normal tabular-nums"
                  >
                    {formatShortDay(duty.served_on)}
                  </th>

                  <td className="py-2.5 pr-3">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-medium">
                        {DUTY_SLOT_LABELS[duty.slot]}
                      </span>

                      {yellow && (
                        <span className="rounded-full bg-duty-yellow/25 px-1.5 py-0.5 text-[10px] leading-none text-ink">
                          노딱
                        </span>
                      )}

                      {duty.day_off_after && (
                        <span className="rounded-full border border-line px-1.5 py-0.5 text-[10px] leading-none text-ink-soft">
                          명근
                        </span>
                      )}

                      {duty.note && (
                        <span className="text-xs text-ink-soft">
                          {duty.note}
                        </span>
                      )}
                    </span>
                  </td>

                  <td className="hidden py-2.5 pr-3 tabular-nums text-ink-soft sm:table-cell">
                    {dutyTimeLabel(duty.slot)}
                    {crossesMidnight(duty.slot) && (
                      <span className="ml-1 text-xs text-ink-soft">익일</span>
                    )}
                  </td>

                  <td className="py-2.5 text-right tabular-nums text-ink-soft">
                    {jo === null ? (
                      <span className="text-ink-muted">—</span>
                    ) : (
                      `${jo}조`
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
