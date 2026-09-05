'use client';

/**
 * 인쇄 창을 연다. 거기서 '대상: PDF로 저장'을 고르면 첨부할 파일이 나온다.
 *
 * 서버에서 PDF를 만들어 내려주는 방법도 있지만, 그러려면 헤드리스 브라우저를
 * 얹어야 하고 화면과 PDF가 서로 다른 코드를 타게 된다. 어차피 브라우저가 이미
 * 할 줄 아는 일이라 그쪽에 맡겼다.
 */
export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-ink-muted hover:text-ink"
    >
      인쇄 · PDF로 저장
    </button>
  );
}
