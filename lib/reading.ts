/**
 * 대충 읽는 데 걸리는 시간. 한글은 분당 500자쯤으로 잡았어요.
 * 코드 블록·이미지는 눈으로 훑고 넘어가는 편이라 글자 수에서 빼요.
 */
export function readingMinutes(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|-]/g, '')
    .replace(/\s+/g, '');

  return Math.max(1, Math.round(text.length / 500));
}
