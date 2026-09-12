'use client';

import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, Marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { countryName, flagEmoji } from '@/lib/country';
import { TILE_ATTRIBUTION, tileUrl } from '@/lib/tiles';
import { isDarkTheme, watchTheme } from '@/lib/theme';
import { TripPin } from '@/lib/travel';

/**
 * 다녀온 곳에 핀을 찍은 지도.
 *
 * 지도는 자바스크립트가 있어야 그려진다. 그래서 이 아래에는 늘 목록이 함께
 * 놓인다. 지도가 안 떠도 어디를 다녀왔는지는 그 목록으로 전부 읽히고,
 * 검색엔진이 보는 것도 그쪽이다. 지도는 거들 뿐이다.
 */
export default function TravelMap({ pins }: { pins: TripPin[] }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [tilesFailed, setTilesFailed] = useState(false);
  // 지도는 한 번만 그린다. 그때의 핀 목록을 그대로 들고 간다.
  const startPinsRef = useRef(pins);

  useEffect(() => {
    if (!boxRef.current || startPinsRef.current.length === 0) return;

    let map: LeafletMap | null = null;
    let stopWatching: (() => void) | null = null;
    let cancelled = false;

    import('leaflet').then((L) => {
      if (cancelled || !boxRef.current) return;

      map = L.map(boxRef.current, {
        // 페이지를 스크롤하다 지도에 걸려 확대되는 걸 막는다.
        // 지도를 만지려면 한 번 눌러서 뜻을 밝히게 한다.
        scrollWheelZoom: false,
      });

      const tiles = L.tileLayer(tileUrl(isDarkTheme()), {
        maxZoom: 18,
        attribution: TILE_ATTRIBUTION,
      }).addTo(map);

      stopWatching = watchTheme((dark) => tiles.setUrl(tileUrl(dark)));

      /*
        타일을 못 받아오면 지도는 회색 판으로 남는다. 방문자는 그게 고장인지
        원래 그런 화면인지 알 수 없다. 장애를 빈 상태처럼 보이게 두지 않는다.

        타일 한 장이 모자란 건 흔한 일이라 여러 장이 연달아 실패할 때만
        말한다. 지도 가장자리에서 한두 장 빠지는 걸로 경고를 띄우면 그게 더
        시끄럽다.
      */
      let failures = 0;
      tiles.on('tileerror', () => {
        failures += 1;
        if (failures >= 4) setTilesFailed(true);
      });
      tiles.on('tileload', () => {
        failures = 0;
        setTilesFailed(false);
      });

      const icon = L.divIcon({
        className: '',
        html: '<span class="block h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent shadow"></span>',
        iconSize: [0, 0],
      });

      /*
        핀은 누를 수 있는 버튼인데 divIcon 은 alt 옵션을 그냥 버린다. 이름이
        없으면 화면 낭독기에는 '버튼'이라고만 읽혀서, 핀이 몇 개든 구분이
        안 된다. 만든 뒤에 요소를 직접 잡아 이름을 붙인다.

        지도에 붙이자마자 잡으려 하면 null 이 나온다. 화면 범위가 정해지기
        전에는 Leaflet 이 핀을 실제로 그리지 않기 때문이다. 그래서 아래
        fitBounds 까지 끝낸 다음에 한꺼번에 붙인다.
      */
      const named: [Marker, string][] = [];

      const points: [number, number][] = [];

      for (const pin of startPinsRef.current) {
        const { trip } = pin;
        points.push([pin.coord.lat, pin.coord.lng]);

        /*
          말풍선 안은 Leaflet 이 직접 넣는 HTML 이라 Next 의 Link 를 못 쓴다.
          평범한 a 태그를 쓰면 페이지를 통째로 다시 받지만, 어차피 한 번
          넘어가고 마는 자리다. 진짜 링크라 키보드와 새 탭도 그대로 된다.
        */
        const marker = L.marker([pin.coord.lat, pin.coord.lng], { icon })
          .addTo(map!)
          .bindPopup(
            `<a href="/travel/${encodeURIComponent(trip.slug)}">` +
              `<strong>${escapeHtml(flagEmoji(trip.country_code))} ${escapeHtml(trip.place)}</strong>` +
              `</a><br><span>${escapeHtml(countryName(trip.country_code))}` +
              (pin.also > 0 ? ` · 외 ${pin.also}곳` : '') +
              `</span>`
          );

        named.push([
          marker,
          `${trip.place}, ${countryName(trip.country_code)}`,
        ]);
      }

      // 핀이 하나뿐이면 경계 상자가 점 하나라 확대가 끝까지 튄다.
      if (points.length === 1) map.setView(points[0], 9);
      else map.fitBounds(points, { padding: [32, 32] });

      for (const [marker, label] of named) {
        marker.getElement()?.setAttribute('aria-label', label);
      }
    });

    return () => {
      cancelled = true;
      stopWatching?.();
      // Strict Mode 가 effect 를 두 번 돌린다. 치우지 않으면 두 번째가 던진다.
      map?.remove();
    };
  }, []);

  if (pins.length === 0) return null;

  return (
    <div className="relative">
      {/*
        role 이 img 였는데, 그 안에는 누를 수 있는 게 들어가면 안 된다.
        여긴 핀이 담긴 묶음이지 그림이 아니다.
      */}
      <div
        ref={boxRef}
        className="h-80 w-full overflow-hidden rounded-lg border border-line bg-surface sm:h-96"
        aria-label={`다녀온 곳 ${pins.length}군데를 표시한 지도`}
        role="group"
      />

      {tilesFailed && (
        <p
          role="status"
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center text-sm text-ink-soft"
        >
          지도를 불러오지 못했어요. 다녀온 곳은 아래 목록에 그대로 있어요.
        </p>
      )}
    </div>
  );
}

/** 지명이 그대로 HTML 로 들어가는 자리라 꺾쇠와 따옴표를 막는다. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
