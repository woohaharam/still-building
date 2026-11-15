import { describe, expect, it } from 'vitest';
import {
  isUsableRect,
  pixelSize,
  rectFromPoints,
  toNaturalRect,
} from '@/lib/mask';

describe('rectFromPoints', () => {
  it('오른쪽 아래로 끌면', () => {
    expect(rectFromPoints({ x: 10, y: 20 }, { x: 40, y: 60 })).toEqual({
      x: 10,
      y: 20,
      width: 30,
      height: 40,
    });
  });

  it('왼쪽 위로 끌어도 같은 네모', () => {
    // 빼기만 하면 너비가 음수가 되고, 캔버스는 아무것도 안 그린다.
    expect(rectFromPoints({ x: 40, y: 60 }, { x: 10, y: 20 })).toEqual({
      x: 10,
      y: 20,
      width: 30,
      height: 40,
    });
  });

  it('비스듬히 끌어도 같다', () => {
    expect(rectFromPoints({ x: 40, y: 20 }, { x: 10, y: 60 })).toEqual({
      x: 10,
      y: 20,
      width: 30,
      height: 40,
    });
  });
});

describe('toNaturalRect', () => {
  const display = { width: 400, height: 300 };
  const natural = { width: 1200, height: 900 };

  it('줄여 그린 만큼 늘린다', () => {
    // 화면이 원본의 1/3 이라 세 배가 된다.
    expect(
      toNaturalRect({ x: 10, y: 20, width: 100, height: 50 }, display, natural)
    ).toEqual({ x: 30, y: 60, width: 300, height: 150 });
  });

  it('사진 밖으로 나간 부분은 자른다', () => {
    // 끌다가 손이 밖으로 나가는 건 흔하다.
    const out = toNaturalRect(
      { x: 300, y: 250, width: 500, height: 500 },
      display,
      natural
    );

    expect(out.x + out.width).toBe(natural.width);
    expect(out.y + out.height).toBe(natural.height);
  });

  it('음수 자리에서 시작해도 0 부터', () => {
    const out = toNaturalRect(
      { x: -50, y: -50, width: 100, height: 100 },
      display,
      natural
    );

    expect(out.x).toBe(0);
    expect(out.y).toBe(0);
  });

  it('화면 크기를 아직 모르면 빈 네모', () => {
    // 사진이 다 뜨기 전에는 0 이 온다. 그때 나누면 Infinity 가 된다.
    expect(
      toNaturalRect(
        { x: 0, y: 0, width: 10, height: 10 },
        { width: 0, height: 0 },
        natural
      )
    ).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });

  it('같은 크기면 그대로', () => {
    expect(
      toNaturalRect({ x: 5, y: 5, width: 20, height: 20 }, natural, natural)
    ).toEqual({ x: 5, y: 5, width: 20, height: 20 });
  });
});

describe('pixelSize', () => {
  it('넓게 가릴수록 칸이 커진다', () => {
    const small = pixelSize({ x: 0, y: 0, width: 40, height: 40 });
    const large = pixelSize({ x: 0, y: 0, width: 400, height: 400 });

    expect(large).toBeGreaterThan(small);
  });

  it('아무리 작아도 1 은 아니다', () => {
    // 1 이면 원본 그대로라 가린 것이 아니다.
    expect(pixelSize({ x: 0, y: 0, width: 5, height: 5 })).toBeGreaterThan(1);
  });

  it('아무리 커도 한 칸이 영역을 덮지 않는다', () => {
    const huge = { x: 0, y: 0, width: 4000, height: 4000 };
    expect(pixelSize(huge)).toBeLessThan(huge.width);
    expect(pixelSize(huge)).toBe(40);
  });

  it('짧은 쪽을 기준으로 한다', () => {
    // 가로로 긴 띠에서 세로 기준을 쓰면 칸이 영역보다 커진다.
    const wide = pixelSize({ x: 0, y: 0, width: 800, height: 20 });
    expect(wide).toBeLessThanOrEqual(20);
  });
});

describe('isUsableRect', () => {
  it('손이 미끄러져 생긴 점은 버린다', () => {
    expect(isUsableRect({ x: 0, y: 0, width: 1, height: 1 })).toBe(false);
    expect(isUsableRect({ x: 0, y: 0, width: 100, height: 2 })).toBe(false);
  });

  it('가릴 만하면 받는다', () => {
    expect(isUsableRect({ x: 0, y: 0, width: 10, height: 10 })).toBe(true);
  });
});
