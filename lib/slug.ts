/**
 * 주소에 넣어도 깨지지 않는 꼴로 다듬는다.
 *
 * 한글은 남긴다. 주소에서 %EB%B8%94 처럼 부풀긴 하지만 브라우저가 알아서
 * 되돌려 보여주고, 영문으로 옮겨 적는 것보다 사람이 읽기 낫다.
 *
 * 반드시 걷어내야 하는 건 공백과 기호다. 공백이 들어간 주소는 메신저에
 * 붙였을 때 거기서 링크가 끊기고, 대괄호는 %5B 로 바뀌어 주소가 고장난 것처럼
 * 보인다. 실제로 '[25.10.16 ~ 25.10.22]' 같은 slug 가 저장된 적이 있다.
 */
export function slugify(text: string): string {
  return (
    text
      .trim()
      .toLowerCase()
      // 한글·영문·숫자·공백·하이픈만 남긴다. 마침표와 물결과 괄호는 여기서 빠진다.
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      // 'a - b' 처럼 기호 양옆이 공백이면 하이픈이 겹친다.
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
      // 60자에서 자르다 하이픈으로 끝나는 경우
      .replace(/-+$/, '')
  );
}

/**
 * 저장할 slug 를 정한다. 직접 적었으면 그걸 쓰고, 비웠으면 제목에서 만든다.
 * 어느 쪽이든 slugify 를 거치므로 손으로 적은 값도 그대로 들어가지 않는다.
 * 쓸 글자가 하나도 안 남으면 빈 문자열이고, 그건 부르는 쪽에서 막는다.
 */
export function toSlug(typed: string, title: string): string {
  return slugify(typed) || slugify(title);
}
