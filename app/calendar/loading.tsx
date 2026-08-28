import Container from '@/components/Container';

/**
 * loading.tsx 는 그 세그먼트와 아래 모든 자식에 스트리밍 경계를 만든다.
 * 스트리밍이 켜지면 응답 헤더가 먼저 나가버려서, 그 뒤에 notFound() 를 불러도
 * 상태 코드를 못 바꾼다. 없는 주소가 200 으로 나가고 검색엔진은 그걸
 * '내용 없는 페이지'로 색인한다.
 *
 * 그래서 404 가 나야 하는 자리에는 두지 않는다. 달력은 없는 주소가 없고
 * 자식 세그먼트도 없어서 여기만 남겼다.
 */
export default function Loading() {
  return (
    <Container>
      <p className="py-20 text-center text-sm text-ink-muted">불러오는 중...</p>
    </Container>
  );
}
