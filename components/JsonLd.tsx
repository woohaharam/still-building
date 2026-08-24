/**
 * 검색엔진이 읽는 구조화 데이터. 사람 눈에는 안 보이고,
 * 구글이 "이건 블로그 글이고 언제 쓴 거구나"를 알아보게 해준다.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // 우리가 만든 객체만 넣기 때문에 안전하지만, </script>로 빠져나가지
      // 못하게 '<'는 한 번 더 막아둔다.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
