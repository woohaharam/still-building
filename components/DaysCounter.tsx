'use client';

import { useEffect, useState } from 'react';

// 블로그를 시작한 날짜 — 원하는 날짜로 바꿔도 된다.
const LAUNCH_DATE = '2026-08-15';

export default function DaysCounter() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const start = new Date(LAUNCH_DATE);
    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    setDays(diff + 1);
  }, []);

  if (days === null) return null;

  return (
    <span className="tabular-nums" suppressHydrationWarning>
      D+{days}
    </span>
  );
}
