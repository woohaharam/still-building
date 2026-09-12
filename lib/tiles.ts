/**
 * 지도 타일.
 *
 * 열쇠도 계정도 필요 없는 판만 쓴다. 저작권 표시는 지도 위에 남긴다.
 * 그게 이용 조건이다.
 *
 * 처음에는 voyager 자리에 light_all 을 썼다. 그건 그래프나 점을 얹을 배경으로
 * 만든 판이라 일부러 색을 뺀 것이어서, 지도 자체가 주인공인 화면에는 맞지
 * 않았다. 길과 지명이 보이는 쪽으로 바꿨다.
 */
export interface TileStyle {
  /** 밝은 테마에서 쓸 주소. */
  light: string;
  /** 어두운 테마에서 쓸 주소. */
  dark: string;
  attribution: string;
}

const CARTO = '&copy; <a href="https://carto.com/attributions">CARTO</a>';
const OSM =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

/**
 * 고를 수 있는 판들. 바꾸려면 아래 ACTIVE 한 줄만 고치면 된다.
 *
 * 어느 게 나은지는 취향이라 코드로 정할 수 없다. 그래서 골라 끼울 수 있게
 * 이름을 붙여뒀다.
 */
export const TILE_STYLES = {
  /** 길과 지명이 또렷한 판. 여행 지도에는 이게 맞다. */
  voyager: {
    light:
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: `${OSM} ${CARTO}`,
  },
  /** 색을 뺀 판. 위에 데이터를 잔뜩 얹을 때 쓴다. */
  muted: {
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: `${OSM} ${CARTO}`,
  },
  /** OpenStreetMap 기본 판. 색이 제일 진하고 어두운 짝이 없다. */
  osm: {
    light: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    dark: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: OSM,
  },
} satisfies Record<string, TileStyle>;

const ACTIVE: TileStyle = TILE_STYLES.voyager;

export const TILE_ATTRIBUTION = ACTIVE.attribution;

export function tileUrl(dark: boolean): string {
  return dark ? ACTIVE.dark : ACTIVE.light;
}
