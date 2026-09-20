'use client';

import { dayNumber, seoulDateKey } from '@/lib/calendar';
import { useClientValue } from '@/lib/use-client-value';

// 블로그를 시작한 날짜 — 원하는 날짜로 바꿔도 된다.
const LAUNCH_DATE = '2026-08-15';

/**
 * 며칠째인지.
 *
 * 전에는 지금 시각에서 시작일을 뺀 밀리초를 하루로 나눴다. 그러면 세는 기준이
 * UTC 자정이라, 한국 시간 자정부터 아침 아홉 시까지는 하루가 덜 나왔다 —
 * 매일 밤 아홉 시간 동안 머리글의 숫자가 틀렸다.
 *
 * 지금은 두 날짜를 날 번호로 바꿔서 뺀다. 시각이 개입할 자리가 없다.
 */
function daysSinceLaunch(): number {
  return dayNumber(seoulDateKey()) - dayNumber(LAUNCH_DATE) + 1;
}

/** 서버와 브라우저의 '지금'이 달라서 붙은 뒤에 센다. */
export default function DaysCounter() {
  const days = useClientValue(daysSinceLaunch);

  if (days === null) return null;

  return (
    <span className="tabular-nums" suppressHydrationWarning>
      D+{days}
    </span>
  );
}
