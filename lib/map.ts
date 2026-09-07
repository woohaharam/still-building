/**
 * 지도 좌표 계산.
 *
 * 등장방형 도법(equirectangular)을 쓴다. 경도를 가로에, 위도를 세로에 그대로
 * 편다. 고위도가 옆으로 늘어나는 대신 계산이 나눗셈 하나라, 핀을 얹는 쪽도
 * 눌린 자리를 좌표로 되돌리는 쪽도 같은 식 하나면 끝난다.
 *
 * 경로 데이터(lib/map-data.ts)도 같은 식으로 구웠다. 둘이 어긋나면 핀이
 * 엉뚱한 데 찍히므로, 도법을 바꾸려면 scripts/build-map.mjs 도 같이 고쳐야 한다.
 */
export interface MapFrame {
  /** viewBox 의 크기. 실제 화면 크기가 아니라 좌표계의 크기다. */
  width: number;
  height: number;
  lngLeft: number;
  lngRight: number;
  latTop: number;
  latBottom: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Coord {
  lng: number;
  lat: number;
}

/** 경위도 → 지도 안의 자리. 지도 밖이면 null. */
export function project(frame: MapFrame, coord: Coord): Point | null {
  if (!isFinite(coord.lng) || !isFinite(coord.lat)) return null;
  if (coord.lng < frame.lngLeft || coord.lng > frame.lngRight) return null;
  if (coord.lat > frame.latTop || coord.lat < frame.latBottom) return null;

  return {
    x:
      ((coord.lng - frame.lngLeft) / (frame.lngRight - frame.lngLeft)) *
      frame.width,
    y:
      ((frame.latTop - coord.lat) / (frame.latTop - frame.latBottom)) *
      frame.height,
  };
}

/**
 * 지도 안의 자리 → 경위도. project 의 반대다.
 *
 * 관리자에서 지도를 눌러 자리를 고를 때 쓴다. 손으로 위경도를 받아적게 하면
 * 결국 안 적게 되고, 안 적힌 여행은 핀이 없다.
 */
export function unproject(frame: MapFrame, point: Point): Coord {
  return {
    lng:
      frame.lngLeft +
      (point.x / frame.width) * (frame.lngRight - frame.lngLeft),
    lat:
      frame.latTop -
      (point.y / frame.height) * (frame.latTop - frame.latBottom),
  };
}

/** 0~100 의 퍼센트로. 지도를 어떤 크기로 늘려도 핀이 따라온다. */
export function percent(frame: MapFrame, point: Point) {
  return {
    left: (point.x / frame.width) * 100,
    top: (point.y / frame.height) * 100,
  };
}

/** 위경도로 쓸 수 있는 값인지. DB 에서 온 값을 그대로 믿지 않는다. */
export function isCoord(lng: unknown, lat: unknown): boolean {
  return (
    typeof lng === 'number' &&
    typeof lat === 'number' &&
    isFinite(lng) &&
    isFinite(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
}
