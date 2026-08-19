8월 15일 밤에 시작해서 5일째다. Next.js 14 App Router, Supabase(Postgres + Storage), Vercel. 흔한 조합이다.

기능을 붙이는 것보다 아래 여섯 개에서 시간을 훨씬 많이 썼다. 기록해둔다.

## 1. 관리자 비밀번호가 클라이언트 번들에 그대로 박혀 있었다

처음에 `/admin` 인증을 이렇게 했다.

```tsx
if (passcode === process.env.NEXT_PUBLIC_ADMIN_PASSCODE) {
  sessionStorage.setItem(SESSION_KEY, '1');
  setUnlocked(true);
}
```

두 가지가 잘못됐다.

**첫째, `NEXT_PUBLIC_` 접두어가 붙은 환경변수는 빌드할 때 클라이언트 번들에 문자열로 그대로 들어간다.** 비밀번호가 배포된 JS 파일 안에 평문으로 있었다는 뜻이다. 브라우저에서 소스 검색만 해도 나온다.

**둘째, 더 큰 문제는 이게 화면만 가렸다는 거다.** 통과하든 말든 데이터베이스는 아무것도 안 막고 있었다.

```sql
-- 처음에 넣었던 정책
create policy "anyone with anon key can manage posts (MVP)"
  on posts for all
  using (true)
  with check (true);
```

`using (true)`. 조건이 없다. anon key는 사이트에 공개되는 값이니까, 개발자 도구 콘솔에서 `supabase.from('posts').delete()` 한 줄이면 남의 글이 다 날아간다. 비밀번호를 몰라도.

Supabase Auth로 바꾸고, 검사를 DB로 내렸다.

```sql
create or replace function public.is_owner()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') = '내이메일@example.com';
$$;

create policy "owner can manage posts"
  on posts for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());
```

`auth.jwt()`는 요청에 실려온 JWT를 읽는다. 로그인 세션이 있어야 값이 나오고, 그 안의 이메일이 내 것과 같아야 통과한다. 판단하는 주체가 브라우저에서 Postgres로 옮겨갔기 때문에 프론트를 아무리 조작해도 소용이 없다.

읽기는 원래대로 열어뒀다.

```sql
create policy "public can read published posts"
  on posts for select
  using (published = true);
```

정책은 OR로 합쳐진다. 그래서 느슨한 정책이 하나라도 남아 있으면 그게 이긴다. Storage 쪽에 예전에 만들어둔 '전체 허용' 정책이 남아 있어서 한참 헤맸다.

## 2. 글을 수정할 때마다 발행일이 오늘로 바뀌었다

저장 로직이 이랬다.

```ts
const payload = {
  title,
  content,
  published,
  published_at: published ? new Date().toISOString() : null,
};
```

새 글을 쓸 때는 맞다. 문제는 수정할 때도 이 코드를 탄다는 거다. 3일 전 글의 오타 하나를 고치면 발행일이 오늘이 된다.

목록이 발행일 내림차순 정렬이라, 오래된 글을 손볼 때마다 그게 맨 위로 올라왔다. 그런데도 한동안 몰랐다. 달력 기능을 만들고 나서 글이 전부 한 날짜에 뭉쳐 찍히는 걸 보고서야 알았다.

```ts
function resolvePublishedAt(): string | null {
  if (!published) return publishedAt;

  if (publishedDate) {
    const current = publishedAt ? new Date(publishedAt) : null;
    // 날짜를 안 건드렸으면 원래 시각을 그대로 둔다
    if (current && toDateKey(current) === publishedDate) return publishedAt;

    const [year, month, day] = publishedDate.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0).toISOString();
  }

  return publishedAt || new Date().toISOString();
}
```

날짜를 새로 만들 때 **정오(12시)로 고정**한 이유는 아래 3번과 이어진다.

## 3. `new Date('2026-08-19')`는 하루 밀릴 수 있다

달력은 두 종류의 날짜를 한 화면에 그린다.

- 일정: Postgres `date` 컬럼 → `'2026-08-19'` 문자열로 온다
- 글: Postgres `timestamptz` 컬럼 → `'2026-08-19T09:00:00+00:00'`로 온다

두 개를 같은 칸에 놓으려면 기준을 통일해야 한다. 그런데 이 문자열을 그냥 `new Date()`에 넣으면 안 된다.

```js
new Date('2026-08-19')
// → 2026-08-19T00:00:00Z (UTC 자정으로 해석된다)
```

날짜만 있는 ISO 문자열은 **UTC로 해석**하고, 시각까지 있으면 로컬로 해석한다. 스펙이 그렇다. 그래서 UTC-5 지역에서 이걸 `.getDate()` 하면 `18`이 나온다. 하루가 밀린다.

한국(UTC+9)에서는 UTC 자정이 오전 9시라 티가 안 난다. 그래서 더 위험하다. 내 화면에서는 멀쩡한데 다른 시간대 사용자한테만 깨진다.

날짜 문자열을 직접 쪼개서 로컬 기준으로 만들었다.

```ts
export type DateKey = string; // 'YYYY-MM-DD'

export function toDateKey(date: Date): DateKey {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1); // 로컬 자정
}
```

`new Date(y, m, d)` 형태의 생성자는 로컬 시간으로 해석한다. 이제 일정이든 글이든 전부 `DateKey` 문자열로 바꿔서 `Map`에 담고, 달력은 그 키로만 조회한다.

2번에서 발행일을 정오로 저장한 것도 같은 이유다. 자정 근처로 저장하면 시간대가 몇 시간만 달라져도 날짜가 넘어간다. 정오면 ±12시간까지 버틴다.

## 4. OG 이미지에 한글이 전부 □로 나왔다

글마다 제목이 박힌 미리보기 카드를 `next/og`로 만들었다. 내부적으로 satori가 JSX를 SVG로 바꾸고 PNG로 굽는다.

문제는 satori에 기본 내장된 폰트에 한글 글리프가 없다는 거다. 제목이 전부 두부(□□□)로 나왔다.

한글 폰트를 저장소에 넣자니 서브셋 안 한 Noto Sans KR이 수 MB다. 서버리스 함수 번들에 넣기엔 부담스럽다.

구글 폰트 API에 `&text=` 파라미터를 붙이면 **그 글자만 담긴 서브셋**을 준다.

```ts
export async function loadKoreanFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const cssUrl =
      'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&text=' +
      encodeURIComponent(text);

    const css = await fetch(cssUrl).then((res) => res.text());

    const fontUrl = css.match(
      /src:\s*url\((https:\/\/[^)]+)\)\s*format\('truetype'\)/
    )?.[1];
    if (!fontUrl) return null;

    const res = await fetch(fontUrl);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}
```

제목 하나 분량이면 **40KB 안쪽**이다.

여기서 걸린 게 하나 더 있다. `format('truetype')`으로 정규식을 잡은 이유는, **satori가 woff2를 못 읽기 때문**이다. 구글 폰트는 요청의 User-Agent를 보고 포맷을 정하는데, 브라우저 UA를 보내면 woff2를 주고 그 외에는 truetype을 준다. 서버에서 부르면 알아서 truetype이 온다.

말줄임표도 서브셋에 넣어야 한다. 제목이 길면 satori가 줄 끝에 `…`을 붙이는데, 그 글자가 폰트에 없으면 그것만 □로 나온다.

```ts
const font = await loadKoreanFont(`${title}${date}${siteName}…`);
```

폰트를 못 받아와도 `null`을 반환하고 이미지 생성은 계속되게 했다. 카드가 안 예쁜 것보다 500이 뜨는 게 나쁘다.

## 5. YouTube IFrame API가 React의 DOM 노드를 훔쳐간다

배경음악 플레이어를 붙였다. YouTube IFrame API는 이렇게 쓴다.

```js
new YT.Player(element, { videoId, events });
```

여기서 `element`는 **iframe으로 교체된다.** 넘긴 노드가 사라지고 그 자리에 iframe이 들어간다.

그래서 이렇게 쓰면 안 된다.

```tsx
// ❌
<div ref={hostRef} />
```

React는 이 `div`를 자기가 관리하는 자식으로 알고 있다. 언마운트할 때 부모에서 이 노드를 제거하려는데 이미 없다. `NotFoundError: Failed to execute 'removeChild'`가 뜬다.

React가 모르는 노드를 만들어서 넘기면 된다.

```tsx
const containerRef = useRef<HTMLDivElement | null>(null);

// JSX에는 빈 컨테이너만 둔다 (자식 없음)
<div ref={containerRef} aria-hidden className="fixed left-[-9999px] ..." />

// 플레이어를 만들 때 자식을 직접 붙인다
const host = document.createElement('div');
containerRef.current.appendChild(host);

const player = new YT.Player(host, {
  width: '1',
  height: '1',
  videoId: TRACKS[indexRef.current].videoId,
  host: 'https://www.youtube-nocookie.com',
  playerVars: { autoplay: 1, controls: 0, playsinline: 1, rel: 0 },
  events: { onReady, onStateChange, onError },
});
```

React는 `containerRef`의 div만 알고 그 안은 신경 쓰지 않는다. 언마운트할 때 컨테이너째로 사라지니까 충돌도 없다.

숨길 때 `display: none` 대신 `left: -9999px`를 쓴 것도 이유가 있다. `display: none`인 iframe은 브라우저가 재생을 막는 경우가 있다.

콜백 안에서 현재 곡 인덱스를 읽어야 하는데, 콜백은 플레이어를 만들 때 한 번만 등록되기 때문에 state를 클로저로 잡으면 값이 안 바뀐다. `useRef`로 따로 들고 있어야 한다.

그리고 **소리 있는 자동재생은 브라우저가 막는다.** 예외가 없다. 첫 재생은 사용자 클릭이 필요하다.

## 6. 다크 모드에 `dark:`를 한 개도 안 썼다

Tailwind에서 다크 모드를 하면 보통 `dark:` 변형을 클래스마다 붙인다. 이미 만들어둔 컴포넌트가 여러 개인데 `bg-paper` → `bg-paper dark:bg-ink` 식으로 전부 고치는 건 손이 많이 간다. 빠뜨리면 그 부분만 안 바뀐다.

색을 CSS 변수로 내리고, Tailwind가 그 변수를 가리키게 했다.

```ts
// tailwind.config.ts
darkMode: 'class',
theme: {
  extend: {
    colors: {
      paper: 'rgb(var(--paper) / <alpha-value>)',
      surface: 'rgb(var(--surface) / <alpha-value>)',
      ink: {
        DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
        soft: 'rgb(var(--ink-soft) / <alpha-value>)',
        muted: 'rgb(var(--ink-muted) / <alpha-value>)',
      },
      line: 'rgb(var(--line) / <alpha-value>)',
    },
  },
},
```

```css
:root {
  --paper: 250 250 248;
  --ink: 26 26 26;
  --line: 229 229 225;
}

.dark {
  --paper: 19 19 18;
  --ink: 237 237 233;
  --line: 46 46 43;
}
```

값이 `#FAFAF8`이 아니라 `250 250 248`인 게 핵심이다. **공백으로 구분된 RGB 채널로 써야** Tailwind의 `<alpha-value>` 자리에 투명도가 들어간다. `bg-surface/60` 같은 표기가 그대로 살아난다.

이렇게 하니 컴포넌트 코드는 한 줄도 안 고쳤다. `<html>`에 `.dark`가 붙는 순간 전체가 뒤집힌다.

남은 문제는 깜빡임이다. React가 붙기 전에는 클래스가 없어서 흰 화면이 한 번 번쩍인 다음 어두워진다. 첫 페인트 전에 실행되는 인라인 스크립트로 막았다.

```tsx
<head>
  <script
    dangerouslySetInnerHTML={{
      __html: `try {
  var saved = localStorage.getItem('theme');
  var dark = saved ? saved === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (dark) document.documentElement.classList.add('dark');
} catch (e) {}`,
    }}
  />
</head>
```

서버는 어느 쪽인지 알 수 없으니 `<html>`에 `suppressHydrationWarning`을 붙여야 한다.

## 정리

여섯 개 중에 **1번과 2번은 기능이 아니라 버그**였고, 둘 다 한참 뒤에야 발견했다.

- 보안 구멍은 화면이 멀쩡해 보여서 안 보였다
- 발행일 버그는 달력을 만들고 나서야 눈에 띄었다

기능을 하나 더 붙였더니 기존 데이터가 이상한 게 드러나는 경험이 흥미로웠다. 달력이 없었으면 발행일이 계속 망가진 채로 쌓였을 거다.

3번은 **내 환경에서만 멀쩡한** 문제였다. 한국이 UTC+9라 날짜가 안 밀렸다. 서쪽 시간대 사용자한테만 깨지는 종류라, 안 찾아봤으면 영영 몰랐을 거다.

아직 짓는 중이다.
