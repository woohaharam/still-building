/**
 * 편집기 서식 버튼이 실제로 하는 일.
 *
 * textarea를 직접 만지지 않고 "이 값에서 이 구간을 이렇게 바꾼다"만 계산한다.
 * 순수 함수라 테스트로 묶어둘 수 있다.
 */

export interface Action {
  label: string;
  title: string;
  /** 선택한 글자를 감싸는 방식 — **굵게** 처럼 */
  wrap?: [string, string];
  /** 줄 앞에 붙이는 방식 — ## 제목 처럼 */
  prefix?: string;
  /** 선택한 글자가 없을 때 대신 넣을 예시 */
  placeholder?: string;
  /** 앞뒤로 빈 줄이 필요한 블록인지 */
  block?: boolean;
}

export const ACTIONS: (Action | 'divider')[] = [
  { label: '제목', title: '큰 제목 (H2)', prefix: '## ', placeholder: '제목' },
  {
    label: '소제목',
    title: '작은 제목 (H3)',
    prefix: '### ',
    placeholder: '소제목',
  },
  'divider',
  {
    label: '굵게',
    title: '굵게',
    wrap: ['**', '**'],
    placeholder: '굵은 글자',
  },
  {
    label: '기울임',
    title: '기울임',
    wrap: ['_', '_'],
    placeholder: '기울인 글자',
  },
  {
    label: '취소선',
    title: '취소선',
    wrap: ['~~', '~~'],
    placeholder: '지운 글자',
  },
  {
    label: '코드',
    title: '인라인 코드',
    wrap: ['`', '`'],
    placeholder: 'code',
  },
  'divider',
  { label: '목록', title: '목록', prefix: '- ', placeholder: '항목' },
  { label: '번호', title: '번호 목록', prefix: '1. ', placeholder: '항목' },
  { label: '인용', title: '인용', prefix: '> ', placeholder: '인용문' },
  {
    label: '코드블록',
    title: '코드 블록',
    wrap: ['```ts\n', '\n```'],
    placeholder: '// 코드',
    block: true,
  },
  {
    label: '링크',
    title: '링크',
    wrap: ['[', '](https://)'],
    placeholder: '링크 글자',
  },
  { label: '구분선', title: '구분선', prefix: '---', block: true },
];

/** 블록 서식은 앞뒤에 빈 줄이 있어야 마크다운이 제대로 읽는다. */
function padBlock(value: string, start: number, end: number, inserted: string) {
  const before = value.slice(0, start);
  const after = value.slice(end);
  const leading = before === '' || before.endsWith('\n\n') ? '' : '\n\n';
  const trailing = after === '' || after.startsWith('\n\n') ? '' : '\n\n';
  return { text: `${leading}${inserted}${trailing}`, leading: leading.length };
}

export function applyAction(
  value: string,
  start: number,
  end: number,
  action: Action
): { value: string; selectionStart: number; selectionEnd: number } {
  const selected = value.slice(start, end);
  const body = selected || action.placeholder || '';

  if (action.wrap) {
    const [open, close] = action.wrap;
    const inserted = `${open}${body}${close}`;
    const padded = action.block ? padBlock(value, start, end, inserted) : null;
    const text = padded ? padded.text : inserted;
    const offset = padded ? padded.leading : 0;

    return {
      value: value.slice(0, start) + text + value.slice(end),
      selectionStart: start + offset + open.length,
      selectionEnd: start + offset + open.length + body.length,
    };
  }

  const prefix = action.prefix ?? '';

  if (action.block) {
    const padded = padBlock(value, start, end, `${prefix}${body}`);
    const cursor = start + padded.text.length;
    return {
      value: value.slice(0, start) + padded.text + value.slice(end),
      selectionStart: cursor,
      selectionEnd: cursor,
    };
  }

  // 줄 단위 서식은 줄 맨 앞을 기준으로 본다.
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const head = value.slice(lineStart, start);

  // 이미 같은 기호가 붙어 있으면 떼어낸다.
  if (head === '' && value.slice(start).startsWith(prefix)) {
    return {
      value: value.slice(0, start) + value.slice(start + prefix.length),
      selectionStart: start,
      selectionEnd: Math.max(start, end - prefix.length),
    };
  }

  // 줄 중간에서 눌렀으면 줄을 하나 새로 만든다.
  const lead = head.trim() === '' ? '' : '\n';
  const inserted = `${lead}${prefix}${body}`;

  return {
    value: value.slice(0, start) + inserted + value.slice(end),
    selectionStart: start + inserted.length - body.length,
    selectionEnd: start + inserted.length,
  };
}
