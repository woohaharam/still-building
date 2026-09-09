/** 지도 위의 한 점. 경도와 위도. */
export interface Coord {
  lng: number;
  lat: number;
}

/**
 * 위경도로 쓸 수 있는 값인지.
 *
 * DB 에서 온 값을 그대로 믿지 않는다. 두 칸 중 하나만 채워진 반쪽 좌표가
 * 들어오면 핀을 찍을 수 없는데, 화면에서는 '적어뒀다'로 보인다.
 */
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
