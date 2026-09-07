'use client';

import { useState } from 'react';
import { countryName, isDomestic } from '@/lib/country';
import { Coord, MapFrame, percent, project, unproject } from '@/lib/map';
import {
  KOREA_FRAME,
  KOREA_PATH,
  WORLD_FRAME,
  WORLD_PATH,
} from '@/lib/map-data';

/**
 * 지도를 눌러 핀 자리를 고른다.
 *
 * 위경도를 손으로 받아적게 하면 결국 안 적게 되고, 안 적힌 여행은 지도에서
 * 나라 한가운데로 뭉친다. 누르면 되게 만들어야 실제로 쓰인다.
 *
 * 눌린 자리를 좌표로 되돌리는 건 지도를 구울 때 쓴 도법의 역함수다
 * (lib/map.ts 의 unproject). 그래서 화면에서 누른 곳과 나중에 찍히는 핀이
 * 어긋나지 않는다.
 */
export default function CoordPicker({
  countryCode,
  coord,
  onChange,
}: {
  countryCode: string;
  coord: Coord | null;
  onChange: (next: Coord | null) => void;
}) {
  // 국내 여행은 한국 지도로 시작한다. 세계 지도에서 서울과 부산을 가리기는 어렵다.
  const [zoomed, setZoomed] = useState(() => isDomestic(countryCode));

  const frame = zoomed ? KOREA_FRAME : WORLD_FRAME;
  const path = zoomed ? KOREA_PATH : WORLD_PATH;
  const point = coord ? project(frame, coord) : null;

  function pick(event: React.MouseEvent<HTMLButtonElement>) {
    const box = event.currentTarget.getBoundingClientRect();

    onChange(
      unproject(frame, {
        x: ((event.clientX - box.left) / box.width) * frame.width,
        y: ((event.clientY - box.top) / box.height) * frame.height,
      })
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3 text-sm text-ink-soft">
        <span>지도에서 자리 고르기</span>

        <button
          type="button"
          onClick={() => setZoomed(!zoomed)}
          className="rounded-full border border-line px-3 py-1 text-xs transition-colors hover:border-ink-muted hover:text-ink"
        >
          {zoomed ? '세계 지도' : '한국 지도'}
        </button>

        {coord && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-ink-muted underline hover:text-ink-soft"
          >
            지우기
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={pick}
        aria-label={`${zoomed ? '한국' : '세계'} 지도에서 자리 고르기`}
        className="relative block w-full overflow-hidden rounded-md border border-line bg-surface"
      >
        <svg
          viewBox={`0 0 ${frame.width} ${frame.height}`}
          className="block h-auto w-full"
          aria-hidden
        >
          <path d={path} className="fill-ink-muted/25" />
        </svg>

        {point && (
          <span
            aria-hidden
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-paper bg-accent shadow-sm"
            style={{
              left: `${percent(frame, point).left}%`,
              top: `${percent(frame, point).top}%`,
            }}
          />
        )}
      </button>

      <p className="text-xs text-ink-muted">
        {coord ? (
          <>
            {coord.lat.toFixed(3)}, {coord.lng.toFixed(3)}
          </>
        ) : (
          <>비워두면 {countryName(countryCode) || '나라'} 한가운데에 찍혀요.</>
        )}
        {coord && !point && ' — 지금 지도 밖이에요. 지도를 바꿔보세요.'}
      </p>
    </div>
  );
}
