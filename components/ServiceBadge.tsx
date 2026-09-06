import Link from 'next/link';
import { seoulDateKey } from '@/lib/calendar';
import { leaveOn } from '@/lib/leave-dates';
import { getLeaves } from '@/lib/leaves';
import { serviceStanding, serviceStatus } from '@/lib/service';

/**
 * 헤더에 붙는 복무 상태 한 마디.
 *
 * 서버에서 그린다. 브라우저에서 채우면 자바스크립트가 도는 사람에게만
 * 보이고 검색엔진에는 안 잡힌다. 전역했다는 건 이력의 일부라 HTML 에
 * 박혀 있어야 한다.
 *
 * 날짜가 하루 단위로만 바뀌므로 app/layout.tsx 가 한 시간마다 다시 그린다.
 * 그게 없으면 빌드할 때 값이 굳어서, 전역한 날에도 배포 전까지 '복무 중'이
 * 그대로 남는다.
 *
 * 일정을 못 불러오면 getLeaves 가 빈 배열을 준다. 그러면 '휴가 중'까지는
 * 몰라도 '복무 중 / 전역'은 여전히 맞다.
 */
export default async function ServiceBadge() {
  const today = seoulDateKey();
  const status = serviceStatus(today);
  const leave = status.discharged ? null : leaveOn(await getLeaves(), today);
  const standing = serviceStanding(status, leave?.kind ?? null);

  return (
    <Link
      href="/service"
      title="복무 기록"
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
