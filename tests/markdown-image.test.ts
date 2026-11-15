import { describe, expect, it } from 'vitest';
import { IMAGE_SIZE_KEYS, isImageSize } from '@/lib/image-size';
import {
  findImages,
  imageIndexAt,
  joinImageRow,
  replaceImageUrl,
  resizeImage,
} from '@/lib/markdown-image';

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

  // in 연산자를 쓰면 여기서 전부 true 가 나온다.
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

describe('findImages', () => {
  it('본문에 든 사진을 앞에서부터 모은다', () => {
    const found = findImages(
      '앞글\n![하나](a.jpg)\n사이\n![둘](b.jpg "small")'
    );

    expect(found.map((i) => [i.index, i.alt, i.url, i.size])).toEqual([
      [0, '하나', 'a.jpg', 'large'],
      [1, '둘', 'b.jpg', 'small'],
    ]);
  });

  it('크기가 아닌 제목은 크기로 읽지 않는다', () => {
    // 제목 자리를 크기로 쓰지만, 사람이 적은 진짜 제목도 올 수 있다.
    expect(findImages('![a](x.jpg "우리 집 고양이")')[0].size).toBe('large');
  });

  it('사진이 없으면 빈 목록', () => {
    expect(findImages('그냥 글입니다')).toEqual([]);
  });
});

describe('resizeImage', () => {
  const two = '![하나](a.jpg)\n![둘](b.jpg)';

  it('고른 것만 바꾼다', () => {
    expect(resizeImage(two, 1, 'small')).toBe(
      '![하나](a.jpg)\n![둘](b.jpg "small")'
    );
  });

  it('같은 주소가 두 번 나와도 자리로 찾는다', () => {
    // 주소로 찾으면 둘 다 바뀐다.
    const same = '![a](x.jpg)\n![a](x.jpg)';
    expect(resizeImage(same, 0, 'medium')).toBe(
      '![a](x.jpg "medium")\n![a](x.jpg)'
    );
  });

  it('기본 크기로 되돌리면 제목을 지운다', () => {
    expect(resizeImage('![a](x.jpg "small")', 0, 'large')).toBe('![a](x.jpg)');
  });

  it('없는 번호는 본문을 그대로 둔다', () => {
    expect(resizeImage(two, 9, 'small')).toBe(two);
  });
});

describe('replaceImageUrl', () => {
  it('주소만 갈고 크기와 설명은 지킨다', () => {
    expect(replaceImageUrl('![설명](old.jpg "small")', 0, 'new.jpg')).toBe(
      '![설명](new.jpg "small")'
    );
  });
});

describe('joinImageRow', () => {
  it('이어진 사진 줄을 한 줄로 모은다', () => {
    const before = '글\n![a](1.jpg)\n![b](2.jpg)\n![c](3.jpg)\n뒷글';
    const cursor = before.indexOf('![b]');

    expect(joinImageRow(before, cursor).value).toBe(
      '글\n![a](1.jpg) ![b](2.jpg) ![c](3.jpg)\n뒷글'
    );
  });

  it('글이 섞인 줄에서 멈춘다', () => {
    // 글까지 끌어올리면 문단이 뒤섞인다.
    const before = '![a](1.jpg)\n사진 설명\n![b](2.jpg)';
    expect(joinImageRow(before, 0).value).toBe(before);
  });

  it('혼자 있는 사진은 그대로 둔다', () => {
    const before = '![a](1.jpg)';
    expect(joinImageRow(before, 0).value).toBe(before);
  });

  it('사진이 아닌 줄에서는 아무 일도 안 한다', () => {
    const before = '그냥 글\n![a](1.jpg)';
    expect(joinImageRow(before, 0).value).toBe(before);
  });

  it('합친 줄을 선택해준다', () => {
    // 바로 다시 누르면 어디가 합쳐졌는지 보이게.
    const before = '![a](1.jpg)\n![b](2.jpg)';
    const after = joinImageRow(before, 0);

    expect(after.value.slice(after.selectionStart, after.selectionEnd)).toBe(
      '![a](1.jpg) ![b](2.jpg)'
    );
  });
});

describe('imageIndexAt', () => {
  const content = '글\n![a](1.jpg)\n글\n![b](2.jpg)';

  it('본문 위치로 몇 번째인지 찾는다', () => {
    expect(imageIndexAt(content, content.indexOf('![a]'))).toBe(0);
    expect(imageIndexAt(content, content.indexOf('![b]'))).toBe(1);
  });

  it('사진 바깥 위치는 -1', () => {
    expect(imageIndexAt(content, 0)).toBe(-1);
  });

  it('같은 주소가 두 번 나와도 자리로 가른다', () => {
    const same = '![a](x.jpg) ![a](x.jpg)';
    expect(imageIndexAt(same, same.lastIndexOf('![a]'))).toBe(1);
  });
});

describe('joinImageRow — 빈 줄로 띄워진 사진', () => {
  it('빈 줄 하나는 건너뛰고 합친다', () => {
    // 사진을 넣을 때 앞뒤로 빈 줄이 붙는다(insertBlock). 제일 흔한 모양이다.
    const before = '글\n\n![a](1.jpg)\n\n![b](2.jpg)\n\n끝';
    const after = joinImageRow(before, before.indexOf('![a]'));

    expect(after.value).toBe('글\n\n![a](1.jpg) ![b](2.jpg)\n\n끝');
  });

  it('빈 줄 둘은 건너뛰지 않는다', () => {
    // 멀리 떨어진 사진까지 끌어오면 무엇이 합쳐질지 가늠할 수 없다.
    const before = '![a](1.jpg)\n\n\n![b](2.jpg)';
    expect(joinImageRow(before, 0).value).toBe(before);
  });

  it('세 장도 한 줄로', () => {
    const before = '![a](1.jpg)\n\n![b](2.jpg)\n\n![c](3.jpg)';
    expect(joinImageRow(before, 0).value).toBe(
      '![a](1.jpg) ![b](2.jpg) ![c](3.jpg)'
    );
  });

  it('빈 줄 너머가 글이면 멈춘다', () => {
    const before = '![a](1.jpg)\n\n사진 설명입니다';
    expect(joinImageRow(before, 0).value).toBe(before);
  });
});
