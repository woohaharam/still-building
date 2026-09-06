import Link from 'next/link';
import { seoulDateKey, seoulMinutes } from '@/lib/calendar';
import { leaveNow } from '@/lib/leave-dates';
import { getLeaves } from '@/lib/leaves';
import { RETURN_TIMES, serviceStanding, serviceStatus } from '@/lib/service';

/**
 * 헤더에 붙는 복무 상태 한 마디.
 *
 * 서버에서 그린다. 브라우저에서 채우면 자바스크립트가 도는 사람에게만
 * 보이고 검색엔진에는 안 잡힌다. 전역했다는 건 이력의 일부라 HTML 에
 * 박혀 있어야 한다.
 *
 * app/layout.tsx 가 주기적으로 다시 그린다. 그게 없으면 빌드할 때 값이 굳어서,
 * 전역한 날에도 배포 전까지 '복무 중'이 그대로 남는다.
 *
 * 일정을 못 불러오면 getLeaves 가 빈 배열을 준다. 그러면 '휴가 중'까지는
 * 몰라도 '복무 중 / 전역'은 여전히 맞다.
 */
export default async function ServiceBadge() {
  const today = seoulDateKey();
  const status = serviceStatus(today);
  const leave = status.discharged
    ? null
    : leaveNow(await getLeaves(), today, seoulMinutes());
  const standing = serviceStanding(status, leave?.kind ?? null);

  // 언제 들어가는지는 칩에 적지 않는다. 헤더가 길어진다. 대신 올려두면 뜬다.
  const returnAt = leave ? RETURN_TIMES[leave.kind] : null;

  return (
    <Link
      href="/service"
      title={returnAt ? `${returnAt} 복귀 · 복무 기록` : '복무 기록'}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${
        standing.strong
          ? 'border-leave-discharge/40 font-semibold text-leave-discharge'
          : 'border-line text-ink-muted hover:border-ink-muted hover:text-ink-soft'
      }`}
    >
      {standing.emoji && <span aria-hidden>{standing.emoji}</span>}
      {standing.label}
    </Link>
  );
}
