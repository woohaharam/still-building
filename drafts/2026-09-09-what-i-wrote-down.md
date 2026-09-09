지난 글이 8월 26일이고 지금 9월 9일이다. 2주 동안 이력서 페이지, 복무 기록, 여행 지도를 붙였다.

그런데 정작 기억에 남는 건 새로 만든 게 아니다. **"고쳤다"고 적어둔 것들이 안 고쳐져 있었던 일**이 세 번 있었다. 그 얘기부터 한다.

## 1. 고쳤다고 README에 적어둔 버그가, 제일 큰 파일에 그대로 있었다

지난 글에서 이렇게 썼다.

> 조회 실패를 `try/catch`로 삼키고 빈 배열을 돌려줬다. 실패와 0건이 같은 값이 된다.

그래서 고쳤다. `getPublishedPosts`는 실패하면 던지고, 화면은 재시도 버튼을 띄운다. README 트러블슈팅에도 적었다.

2주 뒤에 관리자 편집기들을 정리하다가 `PostEditor.tsx`를 열었다.

```tsx
async function loadPosts() {
  setLoading(true);
  const { data, error } = await supabaseClient
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
  if (!error && data) setPosts(data as Post[]);
  setLoading(false);
}
```

`if (!error && data)`. 조회가 실패하면 `posts`가 빈 배열 그대로다. 화면에는 "글이 없음"으로 보인다. **내가 고쳤다고 적어둔 바로 그 모양이다.**

한 줄 아래에는 이런 것도 있었다.

```tsx
async function handleDelete(id: string) {
  if (!confirm('정말 삭제할까요?')) return;
  await supabaseClient.from('posts').delete().eq('id', id);
  loadPosts();
}
```

`error`를 받지도 않는다. RLS에 걸려서 삭제가 거절돼도 목록만 다시 읽고 끝난다. 화면은 아무 말이 없고, 글은 그대로 있다.

왜 여기만 남았느냐면, 편집기가 다섯 개인데 그중 넷은 나중에 만들면서 공용 훅(`useAdminCollection`)을 쓰게 했고, **가장 먼저 만든 `PostEditor`만 혼자 옛날 코드를 들고 있었기 때문이다.** 고칠 때 "posts 조회" 쪽만 보고 관리자 화면은 안 봤다.

훅으로 옮기니 27줄이 줄었고 두 문제가 같이 사라졌다.

```tsx
const saved = await save({ title, slug: finalSlug, /* ... */ });
if (saved) resetForm();
```

`save`는 실패하면 `false`를 돌려주고 상태 문구에 이유를 적는다. 폼도 안 비운다. 실패했는데 폼까지 비우면 방금 쓴 글이 사라진다.

**교훈이랄 게 있다면, "고쳤다"는 파일 단위가 아니라 패턴 단위로 확인해야 한다는 것.** 같은 실수를 한 자리가 하나뿐일 리가 없다.

## 2. 접근성 100점은, 두 페이지 점수였다

지난달에 Lighthouse 접근성을 96에서 100으로 올렸다. 색 대비가 부족하다고 잡혀서 `--ink-muted`를 조정했고, 눈으로 정하지 않고 실제 대비를 계산해서 맞췄다. 그것도 적어뒀다.

그 뒤로 지도, 복무 상태 배지, 이력서를 붙였다. **그 100점이 아직 맞는지 확인한 적이 없었다.**

Lighthouse를 페이지마다 돌리기는 번거로워서, 헤드리스 브라우저에 axe-core를 넣고 11개 페이지를 라이트·다크 양쪽으로 한 번에 훑었다.

```js
await send('Runtime.evaluate', { expression: AXE });
const res = await send('Runtime.evaluate', {
  expression: `axe.run(document, { resultTypes: ['violations'] })
    .then(r => JSON.stringify(r.violations))`,
  awaitPromise: true,
  returnByValue: true,
});
```

`/service`에서 7곳이 걸렸다. serious.

원인은 배경이었다. 색을 `--paper`(종이색) 하나만 기준으로 맞췄는데, 카드 배경으로 쓰는 `--surface`는 글자와 더 가깝다.

| 색 | `--paper` 위 | `--surface` 위 |
| --- | --- | --- |
| `--ink-muted` | 4.61 | **4.23** |
| `--accent` (라이트) | 4.83 | **4.43** |

WCAG AA 본문 기준이 4.5:1이다. 카드 안에 들어간 흐린 글자는 전부 미달이었다. **화면으로는 두 배경이 구분도 안 된다.** 눈으로는 절대 못 찾는다.

기준을 더 빡빡한 `--surface`로 바꿔서 다시 계산했다. 색조는 지키면서 통과할 만큼만 옮겼다.

```
--ink-muted: 122 112 100  →  116 106 95
--accent:    158 94 66    →  155 92 65
```

같은 검사에서 하나 더 나왔다. 달력의 지난달·다음달 날짜다.

```tsx
${inMonth ? '' : 'opacity-30'}
```

칸 전체를 30%로 눌렀다. 날짜 숫자의 대비가 **1.9:1**이 된다. 메인 달력도 `text-ink-muted/60`으로 2.4:1이었다.

흐리게 보이는 것과 못 읽는 것은 다르다. 글자는 읽히는 색으로 올리고 배경 색만 옅게 남겼다. 이번 달과 구분되는 정도는 그대로다.

11개 페이지 × 두 테마에서 위반 0으로 끝냈다. **처음의 100점은 Lighthouse가 검사한 두 페이지 점수였다는 걸 이때 알았다.**

## 3. 서버가 UTC라, 전역일 아침 9시간 동안 "복무 중"이었다

헤더에 복무 상태를 한 마디로 띄웠다. 복무 중 / 외출 중 / 휴가 중, 전역하면 🎖️.

날짜 계산은 이렇게 시작했다.

```ts
export function serviceStatus(today: DateKey = toDateKey(new Date())) {
```

`toDateKey`는 로컬 시간대로 날짜를 뽑는다. 내 노트북에서는 맞다. 그런데 **Vercel 서버는 UTC로 돈다.**

한국 시간 4월 27일 새벽 3시면 UTC로는 아직 26일 저녁 6시다. 전역일 아침에 사이트를 열면 아홉 시간 동안 화면이 "복무 중"이라고 우긴다.

시간대를 지정해서 찍는 쪽으로 바꿨다.

```ts
const SEOUL_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function seoulDateKey(now: Date = new Date()): DateKey {
  return SEOUL_DATE.format(now);
}
```

`en-CA`는 `YYYY-MM-DD`로 찍힌다. 아홉 시간을 직접 더하는 것보다 안전하다. 서머타임이 있는 나라로 옮겨도 그대로 맞는다.

나중에 시각까지 보게 되면서 하나 더 필요했다.

```ts
const SEOUL_TIME = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Seoul',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});
```

`hourCycle: 'h23'`을 못박은 이유가 있다. `hour12: false`만 주면 환경에 따라 자정이 `24:00`으로 나온다. 그러면 자정의 "0분"이 1440분이 돼서 하루 범위를 벗어난다.

그리고 이 날짜가 서버 HTML에 그대로 박힌다는 문제가 하나 더 있었다. 고정 페이지는 빌드할 때 만들어지니까, 전역한 날에도 다시 배포하기 전까지 "복무 중"이 남는다. 레이아웃에 `revalidate`를 걸어 주기적으로 다시 그리게 했다.

브라우저에서 채울 수도 있었는데 그러면 자바스크립트가 도는 사람에게만 보이고 검색엔진에는 안 잡힌다. 군필 여부는 이력의 일부라 HTML에 있어야 한다고 봤다.

## 4. 러시아 중심점이 태평양 한복판에 찍혔다

여행 지도를 만들면서, 좌표를 적지 않은 여행은 나라 중심점에 찍기로 했다. 나라 윤곽선 데이터에서 무게중심을 계산했다.

결과를 검사하는 테스트를 하나 붙였다.

```ts
it('모든 중심점이 지구 안에 있다', () => {
  for (const [code, [lng, lat]] of Object.entries(COUNTRY_CENTERS)) {
    expect(isCoord(lng, lat), code).toBe(true);
  }
});
```

빨갛게 떴다. **러시아가 경도 202도였다.** 경도는 180까지다. 202도는 존재하지 않는 좌표다.

피지를 봤더니 11도로 나왔다. 아프리카다.

둘 다 날짜변경선 때문이었다. 180도를 넘나드는 나라는 좌표가 180에서 -180으로 튄다. 그대로 평균을 내면 지구 반대편이 나온다.

앞 점과의 차이가 180도를 넘으면 한 바퀴를 더하거나 빼서 이어붙인 다음 계산하고, 결과만 다시 범위 안으로 되돌렸다.

```js
function unwrapLongitudes(ring) {
  const out = [];
  let shift = 0;

  for (let i = 0; i < ring.length; i++) {
    if (i > 0) {
      const delta = ring[i][0] - ring[i - 1][0];
      if (delta > 180) shift -= 360;
      else if (delta < -180) shift += 360;
    }
    out.push([ring[i][0] + shift, ring[i][1]]);
  }

  return out;
}
```

러시아 99.9도, 피지 178도. 제자리를 찾았다.

**이건 화면을 열어보기 전에 테스트가 먼저 잡았다.** 지도에 찍어놓고 봤어도 "러시아 핀이 좀 이상한데" 정도로 넘어갔을 것 같다. 202라는 숫자를 직접 보고서야 이게 계산이 틀린 거라는 걸 알았다.

## 5. 외부 요청 0을 지키려다, 쓸 수 없는 도구를 만들었다

여행 지도를 처음에 이렇게 만들었다. 나라 윤곽선을 빌드 전에 SVG 경로로 구워두고 그것만 그린다. 타일 서버를 안 쓰니까 방문자 IP가 남의 서버로 안 가고, CSP에 구멍을 안 뚫어도 되고, 서버에서 그려지니 자바스크립트 없이도 보인다.

이유는 지금도 다 맞다고 생각한다.

문제는 **관리자 화면에서 좌표를 찍는 데도 같은 지도를 썼다는 것**이다. 나라 윤곽선만 있는 회색 판에는 지명도 길도 없다. 어디를 누르는지 알 수가 없다.

```
"지금은 아무것도 안 보이는데 내가 핀 찍는 건데
 그게 어디 위치인지 정확히 알지를 못하니까"
```

맞는 말이었다. 좌표를 고르는 도구에서 지명이 안 보이면 그 도구는 쓸모가 없다.

Leaflet과 타일 지도로 갈았다. 확인해보니 CSP는 손댈 필요가 없었다. 이미 이렇게 돼 있었다.

```
img-src 'self' data: blob: https:
```

타일은 이미지라 그냥 통과한다. Leaflet은 npm으로 받으면 우리 도메인에서 나가니까 `script-src 'self'`로 충분하다.

타일은 밝고 어두운 판이 다 있는 것을 골랐다. 다크 모드에서 화면 한가운데 흰 판이 박혀 있으면 곤란하다. 테마가 바뀌는 걸 알아채는 방법은 `<html>`의 class를 지켜보는 것뿐이다.

```ts
export function watchTheme(onChange: (dark: boolean) => void): () => void {
  const observer = new MutationObserver(() => onChange(isDarkTheme()));
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => observer.disconnect();
}
```

지난 글에서 댓글창 테마를 맞추느라 같은 걸 썼었다. 그때 배운 게 여기서 다시 나왔다.

번들에서 하나 배웠다. 처음에 `next/dynamic`으로 감쌌다.

```tsx
const MapPicker = dynamic(() => import('./MapPicker'), { ssr: false });
```

빌드하고 보니 **공통 JS가 87.3에서 87.8kB로 늘었다.** 지도를 볼 일 없는 페이지까지 0.5kB를 더 받는다는 뜻이다. 감싸는 장치 자체가 공용 번들에 얹힌 것이다.

`ssr: false`가 필요한지 다시 봤더니, 지도를 만드는 코드가 전부 `useEffect` 안에 있었다. 서버에서는 빈 `<div>`만 그려진다. 감쌀 이유가 없었다.

걷어내니 87.4kB로 돌아왔다. Leaflet 본체는 어차피 `import()`로 별도 청크다.

공개 화면도 결국 타일로 바꿨다. 그러면서 쓰지 않게 된 투영 코드와 **48kB짜리 윤곽선 데이터를 지웠다.** 나라별 중심점만 남았다. `lib/map-data.ts`가 52kB에서 4kB가 됐다.

지우면서 `/privacy`도 고쳤다. 이제 지도 타일 제공처가 방문자 IP를 받는다. 안 적어두면 거짓말이 된다.

## 6. 화살표를 빨리 누르면 한 달만 넘어갔다

복무 달력에서 전역일이 있는 달을 스크린샷 찍으려고 "다음 달"을 일곱 번 눌렀다. 한 달만 넘어갔다.

```tsx
const [year, setYear] = useState(today.getFullYear());
const [month, setMonth] = useState(today.getMonth());

function move(step: number) {
  const next = new Date(year, month + step, 1);
  setYear(next.getFullYear());
  setMonth(next.getMonth());
}
```

`move`가 읽는 `year`, `month`는 **화면에 그려진 시점의 값**이다. React가 한 번 다시 그리기 전에 일곱 번 부르면, 일곱 번 다 같은 값에서 계산한다.

사람이 손으로 누를 때는 사이에 렌더가 끼니까 안 드러난다. 스크립트로 연속해서 누르니까 나왔다.

연·월을 각각 들고 있어서 함수형 업데이트를 쓰기도 애매했다. 하나로 묶었다.

```tsx
const [cursor, setCursor] = useState(() => monthOf(today));

function move(step: number) {
  setCursor((prev) => monthOf(new Date(prev.year, prev.month + step, 1)));
}
```

이전 값을 인자로 받으니까 몇 번을 연속으로 불러도 순서대로 쌓인다.

## 정리

여섯 개 중 셋은 **적어둔 것과 실제가 달랐던 일**이다. 고쳤다고 쓴 버그가 다른 파일에 남아 있었고, 100점이라고 쓴 게 두 페이지 점수였고, 계산해서 맞췄다고 쓴 색이 배경 하나만 보고 맞춘 거였다.

셋 다 나쁜 의도가 아니라 **확인 범위를 좁게 잡아서** 생겼다. 파일 하나를 고치고 "고쳤다"고 적었고, 두 페이지를 재고 "100점"이라고 적었다.

그리고 셋 다 도구가 잡았다. 편집기를 정리하다가, axe로 전 페이지를 훑다가, 테스트가 202라는 숫자를 뱉어서.

지도 얘기는 조금 다르다. 그건 판단이 틀린 게 아니라 **판단을 잘못된 자리에 적용한 것**이다. 공개 화면에서 외부 요청을 줄이는 건 지금도 맞다고 본다. 그 원칙을 나만 쓰는 도구에까지 밀어붙인 게 문제였다. 원칙은 자리마다 값이 다르다.

다음에는 검색 노출 쪽을 손볼 생각이다. 사이트맵과 RSS는 넣어뒀는데 실제로 얼마나 잡히는지는 아직 안 봤다.
