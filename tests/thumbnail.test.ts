import { describe, expect, it } from 'vitest';
import { firstImage, thumbnailOf } from '@/lib/thumbnail';

describe('firstImage', () => {
  it('본문 첫 이미지를 찾는다', () => {
    expect(firstImage('글\n\n![사진](https://a.com/1.png)\n\n뒤')).toBe(
      'https://a.com/1.png'
    );
  });

  it('여러 장이면 첫 번째만', () => {
    const md = '![a](https://a.com/1.png)\n![b](https://a.com/2.png)';
    expect(firstImage(md)).toBe('https://a.com/1.png');
  });

  it('크기 지정이 붙어 있어도 주소만 가져온다', () => {
    expect(firstImage('![사진](https://a.com/1.png "small")')).toBe(
      'https://a.com/1.png'
    );
  });

  it('꺾쇠로 감싼 주소도 읽는다', () => {
    expect(firstImage('![사진](<https://a.com/1.png>)')).toBe(
      'https://a.com/1.png'
    );
  });

  it('사이트 내부 경로도 받는다', () => {
    expect(firstImage('![사진](/profile.jpg)')).toBe('/profile.jpg');
  });

  it('코드 블록 안의 이미지는 예시라 무시한다', () => {
    const md =
      '```md\n![예시](https://a.com/x.png)\n```\n\n![진짜](https://a.com/real.png)';
    expect(firstImage(md)).toBe('https://a.com/real.png');
  });

  it('인라인 코드 안도 무시한다', () => {
    expect(
      firstImage('`![예시](https://a.com/x.png)` 이렇게 씁니다')
    ).toBeNull();
  });

  it('이미지가 없으면 null', () => {
    expect(firstImage('그냥 글입니다')).toBeNull();
  });

  it('data: 주소는 목록에 걸지 않는다', () => {
    expect(firstImage('![x](data:image/png;base64,AAAA)')).toBeNull();
  });
});

describe('thumbnailOf', () => {
  it('커버가 있으면 커버가 우선', () => {
    expect(
      thumbnailOf({
        cover_image_url: 'https://a.com/cover.png',
        content: '![본문](https://a.com/body.png)',
      })
    ).toBe('https://a.com/cover.png');
  });

  it('커버가 없으면 본문에서 찾는다', () => {
    expect(
      thumbnailOf({
        cover_image_url: null,
        content: '![본문](https://a.com/body.png)',
      })
    ).toBe('https://a.com/body.png');
  });

  it('둘 다 없으면 null', () => {
    expect(thumbnailOf({ cover_image_url: null, content: '글만' })).toBeNull();
  });
});
