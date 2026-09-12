'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap, Marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Coord } from '@/lib/map';
import { TILE_ATTRIBUTION, tileUrl } from '@/lib/tiles';
import { isDarkTheme, watchTheme } from '@/lib/theme';

/**
 * 실제 지도를 눌러 좌표를 고른다.
 *
 * 처음에는 나라 윤곽선만 그린 SVG 위에서 눌렀는데, 지명도 길도 없으니 어디를
 * 누르는지 알 수가 없었다. 좌표를 고르는 화면에서 그건 쓸모가 없다.
 *
 *
 * 타일은 공개 화면과 같은 것을 쓴다 (lib/tiles.ts). CSP 의 img-src 가 이미
 * https 를 열어둬서 그대로 통과하고, leaflet 은 npm 으로 받아 우리 도메인에서
 * 나가므로 script-src 도 손대지 않았다.
 */
export default function MapPicker({
  coord,
  fallback,
  onChange,
}: {
  coord: Coord | null;
  /** 아직 안 고른 상태에서 지도를 어디에 맞춰 열지. */
  fallback: Coord;
  onChange: (next: Coord) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);

  // 콜백이 바뀔 때마다 지도를 다시 만들지 않으려고 최신 값만 담아둔다.
  // 그리는 중이 아니라 화면에 붙은 뒤에 채운다. 지도를 누르는 건 그 뒤의 일이다.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const startRef = useRef({ coord, fallback });

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    let map: LeafletMap | null = null;
    let stopWatching: (() => void) | null = null;
    let cancelled = false;

    // 브라우저에서만 돌아가는 라이브러리라 화면이 붙은 뒤에 불러온다.
    import('leaflet').then((L) => {
      if (cancelled || !boxRef.current) return;

      const { coord: at, fallback: near } = startRef.current;
      const center = at ?? near;

      map = L.map(boxRef.current, { attributionControl: true }).setView(
        [center.lat, center.lng],
        at ? 11 : 6
      );

      const tiles = L.tileLayer(tileUrl(isDarkTheme()), {
        maxZoom: 18,
        attribution: TILE_ATTRIBUTION,
      }).addTo(map);

      stopWatching = watchTheme((dark) => tiles.setUrl(tileUrl(dark)));

      /*
        기본 마커는 아이콘 이미지를 CSS 상대 경로로 찾는데 번들러를 거치면
        그 경로가 깨진다. 이미지 대신 우리가 만든 요소를 꽂으면 그 문제가
        아예 없고 사이트 색도 그대로 쓴다.
      */
      const icon = L.divIcon({
        className: '',
        html: '<span class="block h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent shadow"></span>',
        iconSize: [0, 0],
      });

      if (at)
        markerRef.current = L.marker([at.lat, at.lng], { icon }).addTo(map);

      map.on('click', (event) => {
        const next = { lng: event.latlng.lng, lat: event.latlng.lat };

        if (markerRef.current) markerRef.current.setLatLng(event.latlng);
        else markerRef.current = L.marker(event.latlng, { icon }).addTo(map!);

        onChangeRef.current(next);
      });

      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      stopWatching?.();
      /*
        Strict Mode 는 effect 를 두 번 실행한다. 치우지 않고 두면 두 번째
        실행이 '이미 지도가 붙은 자리'라며 던진다. 지우고 나가야 한다.
      */
      map?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // 폼에서 다른 여행을 불러오면 지도도 그쪽으로 옮긴다.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !coord) return;

    markerRef.current?.setLatLng([coord.lat, coord.lng]);
    map.setView([coord.lat, coord.lng], Math.max(map.getZoom(), 11));
  }, [coord]);

  /*
    나라를 고르면 그 나라로 옮겨준다. 안 그러면 일본 여행을 적는데 지도는
    한국에 머물러서, 태평양을 가로질러 끌고 가야 한다.

    이미 자리를 찍어둔 뒤라면 건드리지 않는다. 나라를 고치다 애써 찍은 핀이
    화면 밖으로 밀려나면 곤란하다.
  */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || coord) return;

    map.setView([fallback.lat, fallback.lng], 6);
    // 객체가 아니라 숫자를 본다. 매 렌더마다 새 객체가 와서 지도가 튄다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallback.lat, fallback.lng]);

  return (
    <div
      ref={boxRef}
      className="h-72 w-full overflow-hidden rounded-md border border-line"
    />
  );
}
