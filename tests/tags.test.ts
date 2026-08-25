import { describe, expect, it } from 'vitest';
import { POST_TAGS, TAG_LABELS, tagFromSlug, tagLabel } from '@/lib/types';

describe('tagLabel', () => {
  it('아는 태그는 한글 이름을 낸다', () => {
    expect(tagLabel('tech')).toBe('개발');
    expect(tagLabel('life')).toBe('일상');
    expect(tagLabel('retrospective')).toBe('회고');
    expect(tagLabel('diary')).toBe('일기');
  });

  it('모르는 태그는 null 을 낸다', () => {
    expect(tagLabel('없는태그')).toBeNull();
    expect(tagLabel('')).toBeNull();
  });

  it('프로토타입에 있는 이름에 속지 않는다', () => {
    // TAG_LABELS[tag] 로 바로 꺼내면 여기서 함수가 튀어나와 렌더가 깨진다.
    for (const name of ['constructor', 'toString', '__proto__', 'valueOf']) {
      expect(tagLabel(name)).toBeNull();
    }
  });

  it('라벨 목록에 빈 값이 없다', () => {
    for (const tag of Object.keys(TAG_LABELS)) {
      expect(tagLabel(tag)).toBeTruthy();
    }
  });
});

describe('tagFromSlug', () => {
  it('공개 카테고리 slug 를 태그로 되돌린다', () => {
    expect(tagFromSlug('dev')).toBe('tech');
    expect(tagFromSlug('life')).toBe('life');
    expect(tagFromSlug('retrospective')).toBe('retrospective');
  });

  it('일기는 공개 목록에 없어서 slug 로 못 찾는다', () => {
    // /blog/diary 는 잠긴 전용 화면이 따로 받는다.
    expect(tagFromSlug('diary')).toBeNull();
  });

  it('없는 slug 와 프로토타입 이름은 null 이다', () => {
    expect(tagFromSlug('없음')).toBeNull();
    expect(tagFromSlug('constructor')).toBeNull();
  });

  it('공개 카테고리는 셋이고 일기가 끼어 있지 않다', () => {
    expect(POST_TAGS).toHaveLength(3);
    expect(POST_TAGS).not.toContain('diary');
  });
});
