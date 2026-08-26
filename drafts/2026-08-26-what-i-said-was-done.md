지난 글을 쓴 게 8월 19일이고 지금 26일이다. 일주일 동안 커밋이 서른 개쯤 쌓였는데, 새로 만든 것보다 **"다 됐다"고 해놓고 다시 돌아간 것**이 더 많았다.

여섯 개를 적어둔다. 공통점이 하나 있다. 전부 화면상으로는 멀쩡해 보였다.

## 1. 비밀번호가 맞는데 일기가 안 열렸다

비밀번호를 넣어야 보이는 카테고리를 하나 만들었다. 일기.

화면에서 비밀번호를 확인하는 방식은 처음부터 고려하지 않았다. anon 키가 페이지 소스에 그대로 들어 있어서, 개발자 도구를 열고 Supabase에 직접 물어보면 글이 그냥 나온다. 화면 코드가 뭘 하든 상관이 없다.

그래서 세 겹으로 막았다.

```sql
-- 공개 정책에서 일기를 아예 뺀다
create policy "posts_select_published"
  on public.posts
  for select
  using (
    published = true
    and (published_at is null or published_at <= now())
    and not ('diary' = any(tags))
  );
```

이러면 anon 키로 뭘 어떻게 물어봐도 일기는 안 나온다. 꺼내는 방법은 함수 하나뿐이다.

```sql
create or replace function public.open_diary(p_password text)
returns setof public.posts
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.diary_access
     where password_hash = crypt(p_password, password_hash)
  ) then
    raise exception '비밀번호가 맞지 않아요' using errcode = '28000';
  end if;
  return query select * from public.posts where 'diary' = any(tags);
end;
$$;
```

`security definer`는 이 함수가 호출한 사람이 아니라 **함수를 만든 사람의 권한으로 돈다**는 뜻이다. 그래서 위에서 막아둔 정책을 통과할 수 있다.

권한을 빌려 쓰는 함수라 `search_path`를 고정해야 한다. 안 그러면 호출하는 쪽이 자기 스키마를 앞에 끼워넣고 `posts`라는 가짜 테이블을 만들어서 함수를 속일 수 있다. 그래서 `set search_path = public`을 적었다.

배포하고, 비밀번호를 넣었다. 안 열렸다.

다시 넣었다. 안 열렸다. 비밀번호를 새로 설정하고 다시 넣었다. 안 열렸다.

원인은 `search_path`였다. **Supabase는 확장(extension)을 `public`이 아니라 `extensions` 스키마에 설치한다.** `crypt()`는 pgcrypto가 주는 함수다. `search_path`에 `public`만 적어뒀으니 함수 안에서 `crypt`를 못 찾았다.

```diff
-set search_path = public
+set search_path = public, extensions
```

한 단어였다.

고약했던 건 증상이었다. `crypt`를 못 찾으면 함수 전체가 예외를 던진다. 그런데 화면 쪽 코드는 이렇게 생겨 있었다.

```ts
const { data, error } = await supabaseClient.rpc('open_diary', {
  p_password: password,
});
if (error) throw new Error('비밀번호가 맞지 않아요.');
```

**함수가 실패한 것과 비밀번호가 틀린 것이 화면에서 똑같이 보였다.** 그래서 나는 일주일 내내 비밀번호를 의심했다. 정작 함수는 어떤 값을 넣어도 실패하고 있었는데.

에러를 갈랐다.

```ts
function explain(error: { code?: string; message?: string }) {
  const code = error.code ?? '';
  const message = error.message ?? '';

  // 함수 자체가 없다 — 마이그레이션을 아직 안 돌렸다
  if (code === 'PGRST202' || /open_diary/.test(message)) {
    return '일기 기능이 아직 준비되지 않았어요. (마이그레이션 필요)';
  }
  // crypt 를 못 찾는다 — search_path 에 extensions 가 빠졌다
  if (code === '42883' || /crypt/.test(message)) {
    return '서버 설정이 덜 끝났어요. (pgcrypto 경로 확인 필요)';
  }
  if (code === '28000' || /비밀번호/.test(message)) {
    return '비밀번호가 맞지 않아요.';
  }

  console.error('open_diary 실패:', error);
  return '지금은 열 수 없어요. 잠시 뒤에 다시 시도해주세요.';
}
```

`42883`은 Postgres의 `undefined_function`이다. 처음부터 이 코드를 갈라놨으면 5분이면 끝났을 문제였다.

**실패를 한 문구로 뭉뚱그리면 고칠 데를 못 찾는다.** 이건 지난 글 3번에서 "DB 장애가 글이 없음으로 보였다"고 썼던 것과 정확히 같은 실수다. 같은 걸 한 달도 안 돼서 또 했다.

## 2. 그 비밀번호를 공개 저장소에 커밋했다

마이그레이션 파일 맨 아래에 비밀번호 설정하는 SQL을 주석으로 넣어뒀다.

```sql
-- insert into public.diary_access (id, password_hash)
-- values (true, crypt('여기에_비밀번호', gen_salt('bf')))
-- on conflict (id) do update
--   set password_hash = excluded.password_hash;
```

자리표시자를 실제 값으로 바꿔서 커밋했다. 주석이라 실행되지도 않는 줄이었고, 그래서 별생각이 없었다.

이 저장소는 공개돼 있다.

파일에서 지웠다. 그런데 **git은 지운 걸 지우지 않는다.** 커밋 하나만 열면 그대로 보인다.

```bash
git show 298c6c4 -- supabase-migration-counts-diary.sql
```

history를 다시 쓰면 되긴 한다. `filter-repo`로 갈아엎고 강제 푸시하면 커밋 해시가 전부 바뀐다. 하지만 이미 GitHub에 올라갔고, 올라간 시점부터 크롤러와 캐시가 붙는다. 지웠다고 안 본 게 되지 않는다.

그래서 history를 건드리는 대신 **비밀번호를 새 값으로 바꿨다.** 노출된 값은 이제 아무 데도 안 맞는다. 그게 실제로 문제를 없애는 유일한 방법이었다.

배운 건 간단하다. 주석이든 아니든, 실행되든 안 되든, **공개 저장소에 적은 문자열은 공개된 것이다.** 지금은 파일에 이렇게 적혀 있다.

```sql
-- 여기 실제 비밀번호를 적지 말 것. 주석이라도 마찬가지다.
-- 이 저장소는 공개돼 있고, 파일에서 지워도 커밋 기록에는 남는다.
-- SQL Editor 에 붙여넣을 때만 값을 채워서 실행한다.
```

## 3. 조회수를 세려고 UPDATE 권한을 열 뻔했다

글마다 몇 번 읽혔는지 보여주고 싶었다. 숫자를 1 올리려면 `posts` 테이블을 UPDATE 해야 한다.

방문자에게 UPDATE를 열면 어떻게 되는지 잠깐 생각해봤다.

```js
// 개발자 도구 콘솔에서
await supabase.from('posts').update({ title: '아무거나' }).eq('id', '...');
```

RLS 정책은 "어떤 행을" 고칠 수 있는지는 따지지만 "어떤 칼럼을" 고치는지는 안 따진다. `view_count`를 올리라고 열어준 문이 제목과 본문에도 그대로 열린다.

칼럼 단위 권한(`grant update (view_count) on posts`)이 있긴 한데, 그건 RLS가 아니라 테이블 권한이라 정책과 따로 논다. 대신 함수 두 개만 열었다.

```sql
create or replace function public.increment_post_view(p_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.posts
     set view_count = view_count + 1
   where slug = p_slug
     and published = true
     and not ('diary' = any(tags));
$$;

revoke all on function public.increment_post_view(text) from public;
grant execute on function public.increment_post_view(text) to anon, authenticated;
```

방문자가 할 수 있는 일은 "이 slug의 조회수를 1 올려라" 하나뿐이다. 다른 칼럼은 손댈 수 없고, 임시저장 글이나 일기의 존재 여부를 이걸로 알아낼 수도 없다.

여기서 정직하게 적어둘 게 있다. **이 숫자는 부풀릴 수 있다.** 함수는 누구나 부를 수 있고 횟수 제한이 없다. 반복 호출하면 그냥 올라간다.

막으려면 IP나 기기 단위로 기록을 남겨야 하는데, 그건 방문자를 추적하는 일이다. 이 사이트는 분석 도구도 광고도 안 붙이기로 했으면서 조회수 때문에 추적을 시작하는 건 앞뒤가 안 맞는다.

그래서 안 막고, 대신 마이그레이션 파일에 적어뒀다.

```sql
-- 한계: 이 함수는 누구나 부를 수 있고 횟수 제한이 없다. 마음먹으면 반복
-- 호출로 숫자를 부풀릴 수 있다. 막으려면 IP 단위 기록이 필요한데 그건
-- 방문자를 추적하는 일이라 이 사이트가 하지 않기로 한 것이다.
-- 그래서 이 숫자는 참고용이지 분석 지표가 아니다.
```

새로고침으로 오르는 것만 막았다. 탭 단위로 한 번만 센다.

```ts
function alreadyCounted(key: string) {
  try {
    if (sessionStorage.getItem(key)) return true;
    sessionStorage.setItem(key, '1');
    return false;
  } catch {
    // 사이트 데이터를 막아둔 브라우저에서는 그냥 세고 넘어간다
    return false;
  }
}
```

## 4. `"constructor"`가 이미지 크기 이름으로 통과했다

본문 이미지에 크기를 지정할 수 있게 했다. 새 문법을 만들지 않고 마크다운 표준인 제목(title) 자리를 썼다.

```md
![설명](주소 "small")
```

다른 마크다운 뷰어에서 열어도 그냥 제목으로 읽히고 깨지지 않는다.

크기 이름인지 확인하는 코드를 이렇게 썼다.

```ts
const IMAGE_SIZES = {
  small: { className: 'mx-auto block max-w-xs' },
  medium: { className: 'mx-auto block max-w-md' },
  large: { className: 'block max-w-full' },
};

function imageSizeClass(title?: string) {
  return title && title in IMAGE_SIZES
    ? IMAGE_SIZES[title].className // ❌
    : IMAGE_SIZES.large.className;
}
```

`in` 연산자는 **프로토타입 체인까지 훑는다.**

```js
'small' in IMAGE_SIZES; // true — 맞다
'constructor' in IMAGE_SIZES; // true — Object.prototype 에서 나왔다
'toString' in IMAGE_SIZES; // true
'__proto__' in IMAGE_SIZES; // true
```

`{}`는 비어 있지 않다. `Object.prototype`을 물려받고 있어서 `constructor`, `toString`, `hasOwnProperty`, `valueOf` 같은 이름이 전부 들어 있다.

그래서 `![설명](주소 "constructor")`라고 쓰면 검사를 통과하고, `IMAGE_SIZES['constructor']`가 `Object` 생성자 함수를 꺼내고, `.className`이 `undefined`가 되고, `class="undefined"`가 붙는다. 이미지가 아무 스타일 없이 나온다.

같은 패턴이 업로드 검증에도 있었다. 이쪽이 더 나쁘다.

```ts
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

const ext = ALLOWED_TYPES[file.type]; // ❌
if (!ext) throw new Error('이미지만 올릴 수 있어요');
```

`file.type`이 `"constructor"`면 함수가 딸려 나온다. `!ext`가 false라 통과한다. **이미지가 아닌데 이미지 검사를 통과한다.**

`File` 객체의 `type`은 브라우저가 정하는 값이라 실제로 이렇게 만들기는 쉽지 않다. 하지만 이건 "지금은 안 뚫린다"이지 "안전하다"가 아니다.

둘 다 같은 방법으로 고쳤다.

```ts
export function isImageSize(title?: string): title is ImageSize {
  return !!title && Object.prototype.hasOwnProperty.call(IMAGE_SIZES, title);
}
```

`hasOwnProperty`를 `IMAGE_SIZES.hasOwnProperty(title)`로 부르지 않고 `Object.prototype`에서 꺼내 `call`하는 이유도 같다. 객체가 `hasOwnProperty`라는 키를 직접 갖고 있으면 그게 불린다.

`Object.create(null)`로 만들면 프로토타입이 아예 없어서 이 문제가 안 생기지만, 그러면 리터럴로 못 쓴다. 검사하는 쪽을 고치는 게 낫다고 봤다.

테스트로 박아뒀다.

```ts
it('프로토타입에 있는 이름에 속지 않는다', () => {
  for (const name of ['constructor', 'toString', '__proto__', 'valueOf']) {
    expect(isImageSize(name)).toBe(false);
  }
});
```

## 5. 테스트 파일 하나가 통째로 안 돌고 있었다

CI가 빨간불이 떴다. 로그를 봤더니 이거였다.

```
Error: supabaseUrl is required.
```

테스트에서 왜 Supabase를 부르지. 순수 함수만 테스트하는데.

`tests/stats.test.ts`가 `lib/stats.ts`에서 숫자 포맷 함수 하나를 가져오고 있었다. 그런데 그 파일 맨 위가 이렇게 생겼다.

```ts
import { supabaseClient } from './supabase';
```

`lib/supabase.ts`는 불러오는 순간 `createClient()`를 부른다. 환경변수가 없으면 거기서 던진다. **import만 해도 터진다.** 함수를 안 불러도 상관없다.

포맷 함수는 문자열만 만지는 순수 함수였는데, 같은 파일에 있다는 이유로 Supabase 클라이언트를 통째로 끌고 들어온 것이다.

순수한 부분을 갈랐다.

```ts
// lib/count.ts — 여기엔 import 가 없다
export function formatCount(n: number) {
  if (n < 1000) return String(n);
  const thousands = n / 1000;
  return `${thousands.toFixed(thousands < 10 ? 1 : 0).replace(/\.0$/, '')}천`;
}
```

여기서 진짜 문제는 따로 있었다. **이 테스트는 로컬에서도 깨져 있었다.** 내가 못 본 거였다.

```bash
npm test 2>&1 | tail -3
```

뒤 세 줄만 보면 요약만 나오고 실패한 파일 이름은 위로 잘려나간다. 그리고 실패한 파일 안의 테스트는 **아예 실행되지 않으므로 집계에서도 빠진다.** 전체 개수가 조용히 줄어드는데, 늘어난 적은 있어도 줄어든 걸 눈여겨본 적이 없었다.

출력을 자르지 않기로 했다. 개수도 이제는 눈으로 세지 않고 파일별로 뽑아서 맞춰본다.

## 6. 주석 문체를 세 번 고쳤다

이 블로그의 코드 주석은 평서체로 쓴다. 화면에 뜨는 문구만 해요체다. 반말로 적어두면 나중에 읽을 때 설명이 빨리 들어온다.

처음 정리할 때 백 군데쯤 고치고 "이제 존댓말 0건"이라고 적었다. 아니었다.

두 번째로 `.js`와 `.sql`을 훑고 또 0건이라고 적었다. 그것도 아니었다.

세 번째로 세어보니 남은 게 서른 군데였다. 이유는 찾는 방법에 있었다.

```bash
grep -rn "^\s*\(//\|\*\)" --include=*.ts . | grep "해요\|합니다"
```

줄 **맨 앞**이 `//`나 `*`인 줄만 봤다. 그래서 이런 게 통째로 빠졌다.

```js
/*
  어디서 온 자원까지 허용할지 정하는 규칙(CSP).

  지금은 Report-Only — 규칙을 어겨도 막지 않고 콘솔에만 남겨요.
*/
```

블록 주석 안쪽 줄은 `*`로 시작하지 않는다. SQL의 `--`도 패턴에 없었다.

그리고 패턴 자체가 좁았다. `해요`, `어요`, `합니다` 같은 몇 가지 꼴만 알고 있어서 어간이 다른 것들을 전부 지나쳤다.

> 가져와요 · 감춰요 · 그려요 · 남겨요 · 빼요 · 뽑아요 · 잡아요

세 번 틀렸으면 방법이 잘못된 거다. 세는 걸 그만두고 코드로 옮겼다.

먼저 주석만 정확히 뽑는다. 문자열 안의 `//`는 주석이 아니기 때문에, 따옴표를 만나면 닫힐 때까지 건너뛴다.

```ts
if (c === '"' || c === "'" || c === '`') {
  const quote = c;
  i++;
  while (i < src.length) {
    if (src[i] === '\\') { i += 2; continue; }
    if (src[i] === quote) { i++; break; }
    i++;
  }
  continue;
}
```

그리고 목록을 늘리는 대신 규칙으로 바꿨다. 한글 종결어미에는 규칙성이 있다.

**종결의 `요` 앞 음절은 받침이 없고, 모음이 어미에 쓰이는 것들이다.**

- 가져**와**요 · 감**춰**요 · 그**려**요 · 남**겨**요 · **빼**요 → 전부 받침 없음

명사로 끝나는 `요`는 이 조건에서 저절로 걸러진다.

- 필**요** · 중**요** → 앞 음절에 받침이 있다
- 주**요** · 수**요** → 모음이 ㅜ라 어미가 될 수 없다

한글은 유니코드에서 자모가 계산으로 나온다.

```ts
function isPoliteYo(ch: string): boolean {
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  const offset = code - 0xac00;
  if (offset % 28 !== 0) return false; // 받침이 있으면 어미가 아니다
  return ENDING_VOWELS.has(Math.floor(offset / 28) % 21);
}
```

`합니다`체도 비슷하다. `ㅂ니다` 앞 음절은 받침이 ㅂ이다. 그래서 `아니다`는 안 걸린다.

```ts
function endsWithBieup(ch: string): boolean {
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 === 17; // ㅂ 받침
}
```

경계를 테스트로 박았다.

```ts
it('요로 끝나는 명사는 종결이 아니다', () => {
  expect(hasPoliteEnding('이 검사는 필요 없다')).toBe(false);
  expect(hasPoliteEnding('주요 흐름은 아래와 같다')).toBe(false);
});

it('문체를 가리키는 단어 자체는 종결이 아니다', () => {
  expect(hasPoliteEnding('코드 주석은 평서체, 화면은 해요체다.')).toBe(false);
});
```

마지막 테스트는 저장소 전체를 훑는다.

```ts
it('코드 주석에 존댓말이 없다', () => {
  const offenders: string[] = [];
  for (const file of walk(ROOT)) {
    // ...주석만 뽑아서 검사
  }
  expect(offenders).toEqual([]);
});
```

이 규칙으로 열일곱 군데가 더 걸렸다. 세 번을 손으로 세고도 못 찾은 것들이다.

이제 CI가 센다. 내가 "다 고쳤다"고 말할 필요가 없어졌다.

## 정리

여섯 개를 다시 보면 두 종류다.

**모르고 지나간 것** — 1번, 4번, 5번. 화면이 멀쩡했고 CI도 초록불이었다. 일기는 배포까지 마친 상태로 안 열리고 있었고, 테스트 파일 하나는 몇 커밋 동안 안 돌고 있었다.

**알면서 대충 넘어간 것** — 2번, 3번, 6번. 비밀번호는 "주석이니까 괜찮겠지"였고, 문체는 "대충 다 고쳤겠지"였다. 3번만 넘어가기 전에 멈췄다.

두 번째 쪽이 더 창피하다. 1번은 Supabase가 pgcrypto를 어디 설치하는지 몰라서 생긴 일이라 몰랐다고 할 수 있는데, 2번은 그냥 안 봤다.

그리고 6번에서 배운 게 이번 주에서 제일 쓸모 있었다. **같은 걸 세 번 틀렸으면 더 조심하는 게 답이 아니라 방법을 바꾸는 게 답이다.** 손으로 세는 걸 그만두니까 열일곱 군데가 바로 나왔다.

지난 글 마지막에 "아직 짓는 중"이라고 썼는데, 이번 주는 지은 것보다 뜯어본 게 많았다. 그것도 짓는 거라고 생각하기로 했다.
