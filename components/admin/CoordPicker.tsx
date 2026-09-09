'use client';

import { countryName, isDomestic } from '@/lib/country';
import { Coord } from '@/lib/map';
import { COUNTRY_CENTERS } from '@/lib/map-data';
import MapPicker from './MapPicker';

/*
  MapPicker 를 next/dynamic 으로 감쌌다가 걷어냈다. ssr: false 가 필요 없어서다.
  지도를 만드는 코드가 전부 effect 안에 있어 서버에서는 빈 칸만 그려진다.
  감싸두면 그 장치가 공용 번들에 얹혀서, 지도를 볼 일 없는 공개 화면까지
  0.5kB 를 더 받는다. leaflet 본체는 어차피 effect 안의 import() 로 따로
  떨어져 나가므로 감싸서 얻을 게 없었다.
*/

/** 아직 좌표가 없을 때 지도를 어디에 맞춰 열지. 나라를 알면 그 나라로. */
function openAt(countryCode: string): Coord {
  const code = countryCode.trim().toUpperCase();

  if (Object.prototype.hasOwnProperty.call(COUNTRY_CENTERS, code)) {
    const [lng, lat] = COUNTRY_CENTERS[code];
    return { lng, lat };
  }

  const [lng, lat] = COUNTRY_CENTERS.KR;
  return { lng, lat };
}

export default function CoordPicker({
  countryCode,
  coord,
  onChange,
}: {
  countryCode: string;
  coord: Coord | null;
  onChange: (next: Coord | null) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3 text-sm text-ink-soft">
        <span>지도에서 자리 고르기</span>

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

      <MapPicker
        coord={coord}
        fallback={openAt(countryCode)}
        onChange={onChange}
      />

      <p className="text-xs text-ink-muted">
        {coord ? (
          <>
            {coord.lat.toFixed(4)}, {coord.lng.toFixed(4)}
          </>
        ) : (
          <>
            지도를 누르면 그 자리로 정해져요. 비워두면{' '}
            {isDomestic(countryCode) ? '대한민국' : countryName(countryCode)}{' '}
            한가운데에 찍혀요.
          </>
        )}
      </p>
    </div>
  );
}
