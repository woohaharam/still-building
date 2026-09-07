import Link from 'next/link';
import { countryName, flagEmoji } from '@/lib/country';
import { MapFrame, percent } from '@/lib/map';
import { TripPin, tripPins } from '@/lib/travel';
import { Trip } from '@/lib/types';

/**
 * 다녀온 곳에 핀을 찍은 지도.
 *
 * 서버에서 그린다. 윤곽선은 lib/map-data.ts 에 미리 구워둔 SVG 경로라 밖으로
 * 나가는 요청이 없고, 색은 CSS 변수를 따라가서 다크 모드에 저절로 맞는다.
 *
 * 핀은 SVG 안이 아니라 위에 얹은 링크다. SVG 안에 넣으면 지도를 늘릴 때 핀도
 * 같이 늘어나 찌그러진다. 밖에 두고 퍼센트로 자리를 잡으면 지도가 커지든
 * 작아지든 핀은 제 크기를 지키고, 그냥 링크라서 키보드로도 눌린다.
 */
export default function TravelMap({
  frame,
  path,
  trips,
  label,
  className = '',
}: {
  frame: MapFrame;
  path: string;
  trips: Trip[];
  /** 스크린리더가 읽을 지도 이름. */
  label: string;
  /** 폭을 좁힐 때. 한국 지도는 세로로 길어서 그냥 두면 화면을 다 먹는다. */
  className?: string;
}) {
  const pins = tripPins(frame, trips);
  if (pins.length === 0) return null;

  return (
    <figure className={`m-0 ${className}`}>
      <div className="relative overflow-hidden rounded-lg border border-line bg-surface">
        <svg
          viewBox={`0 0 ${frame.width} ${frame.height}`}
          className="block h-auto w-full"
          role="img"
          aria-label={`${label} — 다녀온 곳 ${pins.length}군데`}
        >
          <path d={path} className="fill-ink-muted/25" />
        </svg>

        {pins.map((pin) => (
          <Pin key={pin.trip.id} pin={pin} frame={frame} />
        ))}
      </div>
    </figure>
  );
}

function Pin({ pin, frame }: { pin: TripPin; frame: MapFrame }) {
  const { left, top } = percent(frame, pin.point);
  const { trip } = pin;
  const where = `${trip.place}, ${countryName(trip.country_code)}`;

  return (
    <Link
      href={`/travel/${encodeURIComponent(trip.slug)}`}
      title={pin.also > 0 ? `${where} 외 ${pin.also}곳` : where}
      /*
        핀 끝이 좌표를 가리키게 왼쪽 아래 모서리를 기준점에 맞춘다. 가운데를
        맞추면 그림의 절반만큼 아래를 가리키게 된다.
      */
      className="group absolute -translate-x-1/2 -translate-y-full"
      style={{ left: `${left}%`, top: `${top}%` }}
    >
      <span className="sr-only">{where}</span>

      <span
        aria-hidden
        className="flex flex-col items-center transition-transform group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-paper bg-accent text-[11px] leading-none shadow-sm">
          {flagEmoji(trip.country_code) || '•'}
        </span>
        {/* 핀 끝. 동그라미 아래로 뾰족하게 내려 좌표를 가리킨다. */}
        <span className="-mt-px h-1.5 w-px bg-accent" />
      </span>
    </Link>
  );
}
