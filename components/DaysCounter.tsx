'use client';

import { useClientValue } from '@/lib/use-client-value';

// 블로그를 시작한 날짜 — 원하는 날짜로 바꿔도 된다.
const LAUNCH_DATE = '2026-08-15';

const DAY = 1000 * 60 * 60 * 24;

function daysSinceLaunch(): number {
  const start = new Date(LAUNCH_DATE);
  const diff = Math.floor((Date.now() - start.getTime()) / DAY);
  return diff + 1;
}

/** 며칠째인지. 서버와 브라우저의 '오늘'이 달라서 붙은 뒤에 센다. */
export default function DaysCounter() {
  const days = useClientValue(daysSinceLaunch);

  if (days === null) return null;

  return (
    <span className="tabular-nums" suppressHydrationWarning>
      D+{days}
    </span>
  );
}
