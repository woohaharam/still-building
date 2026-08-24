import { describe, expect, it } from 'vitest';
import { applyAction, type Action } from '@/lib/markdown-format';

const BOLD: Action = {
  label: '굵게',
  title: '굵게',
  wrap: ['**', '**'],
  placeholder: '굵은 글자',
};
const H2: Action = {
  label: '제목',
  title: '제목',
  prefix: '## ',
  placeholder: '제목',
};
const RULE: Action = {
  label: '구분선',
  title: '구분선',
  prefix: '---',
  block: true,
};

describe('applyAction', () => {
  it('선택한 글자를 감싼다', () => {
    const r = applyAction('hello world', 6, 11, BOLD);
    expect(r.value).toBe('hello **world**');
    expect(r.value.slice(r.selectionStart, r.selectionEnd)).toBe('world');
  });

  it('선택한 게 없으면 예시를 넣고 그걸 선택해준다', () => {
    const r = applyAction('', 0, 0, BOLD);
    expect(r.value).toBe('**굵은 글자**');
    expect(r.value.slice(r.selectionStart, r.selectionEnd)).toBe('굵은 글자');
  });

  it('줄 맨 앞에서는 기호만 붙인다', () => {
    const r = applyAction('제목입니다', 0, 5, H2);
    expect(r.value).toBe('## 제목입니다');
  });

  it('줄 중간에서 누르면 줄을 새로 만든다', () => {
    const r = applyAction('앞글자', 3, 3, H2);
    expect(r.value).toBe('앞글자\n## 제목');
  });

  it('같은 기호가 이미 있으면 떼어낸다', () => {
    const r = applyAction('## 제목입니다', 0, 0, H2);
    expect(r.value).toBe('제목입니다');
  });

  it('블록 서식은 앞뒤에 빈 줄을 만든다', () => {
    const r = applyAction('본문', 2, 2, RULE);
    expect(r.value).toBe('본문\n\n---');
  });

  it('이미 빈 줄이 있으면 더 만들지 않는다', () => {
    const r = applyAction('본문\n\n', 4, 4, RULE);
    expect(r.value).toBe('본문\n\n---');
  });
});
