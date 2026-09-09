/*
  나라별 중심점을 굽는다.

  실행: node scripts/build-map.mjs  →  lib/map-data.ts

  좌표를 적지 않은 여행에 핀을 찍을 자리다 (lib/travel.ts 의 tripCoord).
  나라 코드만 있으면 지도에 올라가므로, 어느 나라였는지만 중요한 해외 여행은
  좌표를 따로 안 적어도 된다.

  world-atlas · topojson-client · i18n-iso-countries 는 이 스크립트에서만 쓴다.
  결과물을 저장소에 넣어두므로 배포에는 딸려가지 않는다.
*/
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';

const iso = createRequire(import.meta.url)('i18n-iso-countries');

/**
 * 경도가 날짜변경선을 넘어가도 이어지게 편다.
 *
 * 러시아나 피지처럼 180도를 넘나드는 나라는 좌표가 180에서 -180으로 튄다.
 * 그대로 평균을 내면 러시아 중심이 태평양 한복판(202도)으로, 피지 중심이
 * 아프리카(11도)로 간다. 앞 점과의 차이가 180도를 넘으면 한 바퀴를 더하거나
 * 빼서 이어붙인 다음 계산하고, 결과만 다시 -180~180 안으로 되돌린다.
 */
function unwrapLongitudes(ring) {
  const out = [];
  let shift = 0;

  for (let i = 0; i < ring.length; i++) {
    if (i > 0) {
      const delta = ring[i][0] - ring[i - 1][0];
      if (delta > 180) shift -= 360;
      else if (delta < -180) shift += 360;
    }
    out.push([ring[i][0] + shift, ring[i][1]]);
  }

  return out;
}

/** -180 ~ 180 안으로 되돌린다. */
function wrapLongitude(lng) {
  return ((((lng + 180) % 360) + 360) % 360) - 180;
}

/** 가장 큰 조각의 무게중심. 섬이 여럿인 나라에서 핀이 바다에 찍히지 않게. */
function centroid(geometry) {
  const polygons =
    geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;

  let best = null;
  let bestArea = 0;

  for (const rings of polygons) {
    const ring = unwrapLongitudes(rings[0]);
    let area = 0;
    let x = 0;
    let y = 0;

    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const cross = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
      area += cross;
      x += (ring[j][0] + ring[i][0]) * cross;
      y += (ring[j][1] + ring[i][1]) * cross;
    }

    area /= 2;
    if (Math.abs(area) > bestArea && area !== 0) {
      bestArea = Math.abs(area);
      best = [wrapLongitude(x / (6 * area)), y / (6 * area)];
    }
  }

  return best;
}

const topo = JSON.parse(
  readFileSync('node_modules/world-atlas/countries-110m.json', 'utf8')
);

const centers = {};
for (const country of feature(topo, topo.objects.countries).features) {
  const code = iso.numericToAlpha2(country.id);
  if (!code) continue;

  const point = centroid(country.geometry);
  if (!point) continue;

  centers[code] = [Number(point[0].toFixed(2)), Number(point[1].toFixed(2))];
}

const body = JSON.stringify(centers, null, 2).replace(/"([A-Z]{2})":/g, '$1:');

writeFileSync(
  'lib/map-data.ts',
  `/*
 * scripts/build-map.mjs 가 만든 파일이다. 손으로 고치지 않는다.
 * 다시 구우려면 \`npm run build:map\` 을 실행한다.
 *
 * 출처: Natural Earth (퍼블릭 도메인), world-atlas 로 배포된 것.
 */

/** 나라별 중심점 [경도, 위도]. 좌표를 적지 않은 여행이 여기에 찍힌다. */
export const COUNTRY_CENTERS: Record<string, [number, number]> = ${body};
`
);

console.log(`lib/map-data.ts — 중심점 ${Object.keys(centers).length}개`);
