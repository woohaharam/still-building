/**
 * 화면에 날짜를 적는 방식.
 *
 * 목록·글·일기·미리보기 카드가 제각각 같은 함수를 들고 있었다. 한 곳만
 * 고치면 화면마다 날짜 모양이 달라지므로 여기로 모았다.
 */
export function formatDate(value: string | null) {
  if (!value) return '';
  const d = new Date(value);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}
