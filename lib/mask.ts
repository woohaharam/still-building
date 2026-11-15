/**
 * 사진의 일부를 가리는 데 쓰는 계산.
 *
 * 캔버스에서 떼어낸다. 좌표를 옮기는 식은 눈으로 보면 맞아 보이는데 한 칸씩
 * 어긋나기 쉽고, 화면을 띄워서는 어디가 틀렸는지 알기 어렵다.
 */

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

/** 가리는 방법. 얼굴이나 차 번호는 모자이크, 글자는 검게 칠하는 쪽이 확실하다. */
export type MaskKind = 'pixelate' | 'fill';

export const MASK_LABELS: Record<MaskKind, string> = {
  pixelate: '모자이크',
  fill: '검게',
};

/**
 * 끌기 시작한 점과 끝난 점으로 네모를 만든다.
 *
 * 어느 방향으로 끌든 같은 네모가 나와야 한다. 오른쪽 아래로만 끌 거라고
 * 보고 빼기만 하면 반대로 끌었을 때 너비가 음수가 되고, 캔버스는 그걸
 * 아무것도 그리지 않는 것으로 받아들인다.
 */
export function rectFromPoints(
  from: { x: number; y: number },
  to: { x: number; y: number }
): Rect {
  return {
    x: Math.min(from.x, to.x),
    y: Math.min(from.y, to.y),
    width: Math.abs(to.x - from.x),
    height: Math.abs(to.y - from.y),
  };
}

/**
 * 화면에서 끌어 만든 네모를 원본 사진의 좌표로 옮긴다.
 *
 * 화면에 보이는 사진은 줄여 그린 것이라, 그 위에서 잰 값을 그대로 쓰면
 * 엉뚱한 데가 가려진다. 원본과 화면의 비율만큼 늘린다.
 *
 * 사진 밖으로 나간 부분은 잘라낸다. 끌다가 사진 밖으로 손이 나가는 일은
 * 흔한데, 그대로 두면 캔버스가 사진 밖을 칠하려다 빈 픽셀을 읽는다.
 */
export function toNaturalRect(rect: Rect, display: Size, natural: Size): Rect {
  if (display.width <= 0 || display.height <= 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const scaleX = natural.width / display.width;
  const scaleY = natural.height / display.height;

  const left = clamp(rect.x * scaleX, 0, natural.width);
  const top = clamp(rect.y * scaleY, 0, natural.height);
  const right = clamp((rect.x + rect.width) * scaleX, 0, natural.width);
  const bottom = clamp((rect.y + rect.height) * scaleY, 0, natural.height);

  return {
    x: Math.round(left),
    y: Math.round(top),
    width: Math.round(right - left),
    height: Math.round(bottom - top),
  };
}

/**
 * 모자이크 한 칸의 크기.
 *
 * 가리는 넓이에 견줘 정한다. 어디나 같은 크기로 하면 작게 가린 데는 칸이
 * 너무 커서 모양이 뭉개지고, 넓게 가린 데는 칸이 잘아서 무엇인지 그대로
 * 보인다 — 가린 보람이 없다.
 *
 * 아래위를 막아둔다. 1 이면 가린 것이 아니고, 너무 크면 한 칸이 영역을
 * 통째로 덮어 검게 칠한 것과 같아진다.
 */
export function pixelSize(rect: Rect): number {
  const shorter = Math.min(rect.width, rect.height);
  return clamp(Math.round(shorter / 8), 4, 40);
}

/** 가릴 만한 크기인지. 손이 미끄러져 생긴 점은 버린다. */
export function isUsableRect(rect: Rect): boolean {
  return rect.width >= 4 && rect.height >= 4;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
