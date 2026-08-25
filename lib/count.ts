/**
 * 조회수·공유수를 짧게 보여준다.
 *
 * stats.ts 에 같이 뒀더니 숫자 포맷만 쓰려는 쪽까지 Supabase 클라이언트를
 * 끌고 들어왔다. 그 클라이언트는 불러오는 순간 환경변수를 요구해서,
 * 키가 없는 곳(테스트)에서는 그대로 터진다. 그래서 순수한 부분만 갈라뒀다.
 */
export function formatCount(n: number) {
  if (n < 1000) return String(n);
  const thousands = n / 1000;
  return `${thousands.toFixed(thousands < 10 ? 1 : 0).replace(/\.0$/, '')}천`;
}
