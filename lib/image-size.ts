/**
 * 본문 이미지 크기.
 *
 * 마크다운 표준 문법인 제목(title) 자리를 크기 이름으로 쓴다.
 * ![설명](주소 "small") 같은 꼴이다. 새 문법을 만들지 않아도 되고, 다른 마크다운
 * 뷰어에서 열면 그냥 제목으로 읽혀서 깨지지 않는다.
 */
export const IMAGE_SIZES = {
  small: { label: '작게', className: 'mx-auto block max-w-xs' },
  medium: { label: '중간', className: 'mx-auto block max-w-md' },
  large: { label: '크게', className: 'block max-w-full' },
} as const;

export type ImageSize = keyof typeof IMAGE_SIZES;

export const IMAGE_SIZE_KEYS = Object.keys(IMAGE_SIZES) as ImageSize[];

/**
 * 제목이 크기 이름인지.
 *
 * `title in IMAGE_SIZES` 로 검사하면 안 된다. in 은 프로토타입까지 훑어서
 * "constructor" 나 "toString" 에도 true 를 낸다. 그러면 크기가 조용히
 * 어긋나고 class 에 undefined 가 붙는다.
 */
export function isImageSize(title?: string): title is ImageSize {
  return !!title && Object.prototype.hasOwnProperty.call(IMAGE_SIZES, title);
}

export function imageSizeClass(title?: string) {
  return isImageSize(title)
    ? IMAGE_SIZES[title].className
    : IMAGE_SIZES.large.className;
}
