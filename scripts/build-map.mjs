/*
  지도 데이터를 SVG 경로로 굽는다.

  실행: node scripts/build-map.mjs  →  lib/map-data.ts

  왜 이렇게 하나. 화면에 지도를 띄우는 흔한 방법은 타일 서버에서 이미지를
  받아오는 것인데, 그러면 방문자의 IP 가 남의 서버로 가고 CSP 에 구멍을
  하나 더 뚫어야 한다. 지도 한 장 때문에 치를 값으로는 비싸다.

  그래서 나라 윤곽선을 미리 SVG 경로로 바꿔 저장해두고 그것만 그린다.
  실행할 때 밖으로 나가는 요청이 없고, 서버에서 그려지니 자바스크립트가
  없어도 보이고, 색은 CSS 변수를 따라 테마에 맞춰 바뀐다.

  world-atlas · topojson-client · i18n-iso-countries 는 이 스크립트에서만
  쓴다. 결과물(lib/map-data.ts)을 저장소에 넣어두므로 배포에는 딸려가지 않는다.
*/
import { writeFileSync } from 'node:fs';
import { feature, merge } from 'topojson-client';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const iso = require('i18n-iso-countries');

/** 세계 지도. 남극은 뺀다. 여행 기록에 쓸 일이 없는데 세로만 잡아먹는다. */
const WORLD_FRAME = {
  width: 1000,
  lngLeft: -180,
  lngRight: 180,
  latTop: 84,
  latBottom: -58,
};

/** 한국 지도. 제주(33.2)부터 최북단까지 들어가게 여유를 뒀다. */
const KOREA_FRAME = {
  width: 480,
  lngLeft: 125.4,
  lngRight: 131.4,
  latTop: 38.8,
  latBottom: 32.9,
};

/** 등장방형 도법. 경도와 위도를 그대로 가로세로에 편다. lib/map.ts 와 같은 식이다. */
function frameHeight(frame) {
  const lngSpan = frame.lngRight - frame.lngLeft;
  const latSpan = frame.latTop - frame.latBottom;
  return Math.round((frame.width * latSpan) / lngSpan);
}

function toPath(polygons, frame, { minSpan = 0 } = {}) {
  const height = frameHeight(frame);
  const lngSpan = frame.lngRight - frame.lngLeft;
  const latSpan = frame.latTop - frame.latBottom;

  const px = (lng) => ((lng - frame.lngLeft) / lngSpan) * frame.width;
  const py = (lat) => ((frame.latTop - lat) / latSpan) * height;
  // 1000 폭에서 소수점은 눈에 보이지 않는다. 반올림하면 파일이 삼분의 일로 준다.
  const round = (n) => Math.round(n);

  const draw = (ring, shift) =>
    'M' +
    ring
      .map(([lng, lat]) => `${round(px(lng + shift))} ${round(py(lat))}`)
      .join('L') +
    'Z';

  let d = '';
  for (const rings of polygons) {
    for (const raw of rings) {
      if (raw.length < 4) continue;

      /*
        날짜변경선을 넘는 조각은 좌표가 180 에서 -180 으로 튄다. 그대로 이으면
        지도를 가로지르는 줄이 하나 그어진다 (피지와 축치 반도에서 실제로
        그랬다). 먼저 이어붙인 뒤에 화면에 걸치는 만큼 한 바퀴씩 옮겨 그리면,
        진짜 세계 지도처럼 양쪽 가장자리에 나뉘어 나온다.
      */
      const ring = unwrapLongitudes(raw);

      const lngs = ring.map((p) => p[0]);
      const lats = ring.map((p) => p[1]);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);

      // 점 하나짜리 섬까지 그리면 용량만 늘고 화면에서는 티끌이다.
      if (maxLng - minLng + (maxLat - minLat) < minSpan) continue;
      // 지도 위아래 밖에만 있는 조각은 아예 뺀다. 남극이 여기서 걸러진다.
      if (minLat > frame.latTop || maxLat < frame.latBottom) continue;

      for (let shift = -360; shift <= 360; shift += 360) {
        if (maxLng + shift < frame.lngLeft) continue;
        if (minLng + shift > frame.lngRight) continue;
        d += draw(ring, shift);
      }
    }
  }

  return d;
}

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

function load(resolution) {
  return JSON.parse(
    require('node:fs').readFileSync(
      `node_modules/world-atlas/countries-${resolution}.json`,
      'utf8'
    )
  );
}

// 세계 — 나라 경계는 지우고 육지 윤곽만 남긴다. 핀이 주인공이라 배경은 조용해야 한다.
const coarse = load('110m');
const land = merge(coarse, coarse.objects.countries.geometries);
const worldPath = toPath(land.coordinates, WORLD_FRAME, { minSpan: 0.8 });

// 한국 — 세계 지도의 해상도로는 제주가 점 하나다. 이 조각만 한 단계 촘촘히 쓴다.
const fine = feature(load('50m'), load('50m').objects.countries);
const korea = fine.features.find((f) => f.id === '410');
if (!korea) throw new Error('50m 자료에서 한국을 찾지 못했습니다');
const koreaPath = toPath(korea.geometry.coordinates, KOREA_FRAME);

// 나라별 중심점 — 좌표를 안 적은 여행에 핀을 찍을 자리다.
const centroids = {};
for (const f of feature(coarse, coarse.objects.countries).features) {
  const code = iso.numericToAlpha2(f.id);
  if (!code) continue;

  const point = centroid(f.geometry);
  if (!point) continue;

  centroids[code] = [Number(point[0].toFixed(2)), Number(point[1].toFixed(2))];
}

const frame = (f) => `{
    width: ${f.width},
    height: ${frameHeight(f)},
    lngLeft: ${f.lngLeft},
    lngRight: ${f.lngRight},
    latTop: ${f.latTop},
    latBottom: ${f.latBottom},
  }`;

const out = `/*
 * scripts/build-map.mjs 가 만든 파일이다. 손으로 고치지 않는다.
 * 지도를 다시 구우려면 \`npm run build:map\` 을 실행한다.
 *
 * 출처: Natural Earth (퍼블릭 도메인), world-atlas 로 배포된 것.
 */
import type { MapFrame } from './map';

/** 세계 지도. 남극을 뺀 등장방형 도법. */
export const WORLD_FRAME: MapFrame = ${frame(WORLD_FRAME)};

/** 한반도 남쪽. 세계 지도보다 한 단계 촘촘한 자료를 썼다. */
export const KOREA_FRAME: MapFrame = ${frame(KOREA_FRAME)};

export const WORLD_PATH =
  '${worldPath}';

export const KOREA_PATH =
  '${koreaPath}';

/** 나라별 중심점 [경도, 위도]. 좌표를 적지 않은 여행이 여기에 찍힌다. */
export const COUNTRY_CENTERS: Record<string, [number, number]> = ${JSON.stringify(centroids, null, 2).replace(/"([A-Z]{2})":/g, '$1:')};
`;

writeFileSync('lib/map-data.ts', out);

console.log(
  `lib/map-data.ts — 세계 ${(worldPath.length / 1024).toFixed(1)}KB · ` +
    `한국 ${(koreaPath.length / 1024).toFixed(1)}KB · 중심점 ${Object.keys(centroids).length}개`
);
