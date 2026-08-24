import { describe, expect, it } from 'vitest';
import { IMAGE_SIZE_KEYS, isImageSize } from '@/lib/image-size';

describe('isImageSize', () => {
  it('정해둔 크기 이름만 통과시킨다', () => {
    expect(IMAGE_SIZE_KEYS).toEqual(['small', 'medium', 'large']);
    for (const size of IMAGE_SIZE_KEYS) {
      expect(isImageSize(size)).toBe(true);
    }
  });

  it('빈 값은 크기가 아니다', () => {
    expect(isImageSize(undefined)).toBe(false);
    expect(isImageSize('')).toBe(false);
  });

  it('일반 제목은 크기로 보지 않는다', () => {
    expect(isImageSize('우리 집 고양이')).toBe(false);
    expect(isImageSize('SMALL')).toBe(false);
  });

  // in 연산자를 쓰면 여기서 전부 true 가 나와요.
  it('프로토타입에 있는 이름에 속지 않는다', () => {
    for (const name of [
      'constructor',
      'toString',
      '__proto__',
      'hasOwnProperty',
      'valueOf',
    ]) {
      expect(isImageSize(name)).toBe(false);
    }
  });
});
