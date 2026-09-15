'use client';

import type { DivIcon, Map as LeafletMap } from 'leaflet';
import { isDarkTheme, watchTheme } from './theme';
import { TILE_ATTRIBUTION, tileUrl } from './tiles';

type Leaflet = typeof import('leaflet');

/**
 * 지도 한 판을 세우는 일.
 *
 * 공개 화면(여행 지도)과 관리자 화면(좌표 고르기)이 이 부분을 통째로 각각
 * 들고 있었다. 라이브러리를 늦게 불러오는 것, 타일을 얹는 것, 테마를 따라
 * 판을 갈아끼우는 것, 나갈 때 치우는 것까지 글자가 같았다. 달랐던 건 지도
 * 위에 무엇을 그리느냐뿐이라 그것만 넘겨받는다.
 *
 * 옮기면서 관리자 쪽도 타일 실패를 말하게 됐다. 공개 화면에만 있던 것을
 * 관리자는 못 받고 있었는데, 지도가 회색 판으로 남는 건 양쪽 다 똑같다.
 */

/** 타일 몇 장이 연달아 빠져야 고장이라고 볼지. 한두 장 빠지는 건 흔하다. */
const TROUBLE_AT = 4;

interface MountOptions {
  /** 페이지를 스크롤하다 지도에 걸려 확대되는 걸 막을지. */
  scrollWheelZoom?: boolean;
  /** 타일이 연달아 실패하거나 다시 살아나면 알려준다. */
  onTilesFailed?: (failed: boolean) => void;
  /** 판이 세워진 뒤에 할 일. 핀을 찍거나 클릭을 받는다. */
  draw: (L: Leaflet, map: LeafletMap) => void;
}

/**
 * 지도를 세우고, 치우는 함수를 돌려준다. effect 에서 그대로 return 하면 된다.
 *
 * Strict Mode 는 effect 를 두 번 실행한다. 치우지 않고 두면 두 번째 실행이
 * '이미 지도가 붙은 자리'라며 던지므로, 지우고 나가는 건 선택이 아니다.
 */
export function mountMap(box: HTMLElement, options: MountOptions): () => void {
  let map: LeafletMap | null = null;
  let stopWatching: (() => void) | null = null;
  let cancelled = false;

  // 브라우저에서만 돌아가는 라이브러리라 화면이 붙은 뒤에 불러온다.
  import('leaflet').then((L) => {
    if (cancelled) return;

    map = L.map(box, { scrollWheelZoom: options.scrollWheelZoom ?? true });

    const tiles = L.tileLayer(tileUrl(isDarkTheme()), {
      maxZoom: 18,
      attribution: TILE_ATTRIBUTION,
    }).addTo(map);

    stopWatching = watchTheme((dark) => tiles.setUrl(tileUrl(dark)));

    /*
      타일을 못 받아오면 지도는 빈 판으로 남는다. 보는 사람은 그게 고장인지
      원래 그런 화면인지 알 수 없다. 장애를 빈 상태처럼 보이게 두지 않는다.
    */
    const report = options.onTilesFailed;
    if (report) {
      let failures = 0;

      tiles.on('tileerror', () => {
        failures += 1;
        if (failures >= TROUBLE_AT) report(true);
      });

      tiles.on('tileload', () => {
        failures = 0;
        report(false);
      });
    }

    options.draw(L, map);
  });

  return () => {
    cancelled = true;
    stopWatching?.();
    map?.remove();
    map = null;
  };
}

/**
 * 사이트 색을 쓰는 동그란 핀.
 *
 * Leaflet 기본 마커는 아이콘 이미지를 CSS 상대 경로로 찾는데 번들러를 거치면
 * 그 경로가 깨진다. 이미지 대신 우리가 만든 요소를 꽂으면 그 문제가 아예 없다.
 *
 * 크기는 부르는 쪽이 Tailwind 클래스로 넘긴다. 글자 그대로 소스에 있어야
 * Tailwind 가 그 클래스를 찾아내므로, 조립하지 말고 통째로 적어서 넘긴다.
 */
export function pinIcon(L: Leaflet, sizeClass: string): DivIcon {
  return L.divIcon({
    className: '',
    html:
      `<span class="block ${sizeClass} -translate-x-1/2 -translate-y-1/2` +
      ` rounded-full border-2 border-white bg-accent shadow"></span>`,
    iconSize: [0, 0],
  });
}
