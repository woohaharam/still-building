# STILL BUILDING

> **우주영의 포트폴리오** 겸 개인 블로그. 글쓰기와 일정을 한 곳에서 관리하려고 처음부터 직접 만들었습니다.

**🔗 https://mynameiswoo.vercel.app**

|               |                                                                                                                               |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **기간**      | 2026.08 — (진행 중)                                                                                                           |
| **개발 인원** | 1명 (우주영)                                                                                                                  |
| **기여도**    | 100% — 기획 · 설계 · 구현 · 배포 · 운영                                                                                       |
| **스택**      | Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres · Auth · Storage) · Vercel · Vitest · GitHub Actions |

📄 **[프로젝트 상세 · 구조도 · 트러블슈팅 →](https://mynameiswoo.vercel.app/projects/still-building)**

---

## 숫자로 남은 것

| 항목                  | 결과                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------- |
| Lighthouse 접근성     | **96 → 100점** (대비 미달 요소 3종 → 0)                                                     |
| Lighthouse 성능 · SEO | 92 ~ 100점 / 100점 _(로컬 프로덕션 빌드 기준)_                                              |
| 첫 로드 공통 JS       | **87.3 kB**                                                                                 |
| 테스트                | 순수 함수 **56개** — 날짜 13 · 목차 11 · 마크다운 11 · 유튜브 파싱 10 · RSS 8 · 읽는 시간 3 |
| CI                    | PR마다 포맷 · 린트 · 타입 · 테스트 · 빌드 **5단계** 자동 실행                               |
| 리팩터링              | 588줄 관리자 페이지 → **78 / 70 / 450줄** 세 파일로 분리                                    |

## 시스템 구조

```
 브라우저                Vercel (Next.js)          Supabase                외부
 ─────────────          ──────────────────        ─────────────────       ──────────────────
 방문자 화면      →      서버 컴포넌트 렌더   →     Postgres (posts,        GitHub Discussions
 관리자 /admin           sitemap·robots·RSS        events)                 — 댓글 (giscus)
 localStorage            OG 이미지 (next/og)       RLS — is_owner()        YouTube IFrame API
 (테마·음악)             보안 헤더 · CSP           Auth — 이메일 로그인    — 배경음악
                                                   Storage — 본문 이미지   GitHub Actions — CI
```

- **읽기** — 방문자 → Vercel 서버 렌더 → Supabase에서 `published = true` 인 글만 조회 → HTML 응답
- **쓰기** — `/admin` 로그인 → Supabase Auth 세션 → INSERT/UPDATE → **RLS가 `is_owner()` 검사** → 통과한 것만 반영
- **검색** — `sitemap.xml` · `feed.xml` · JSON-LD 생성 → 구글 · 네이버 크롤러

권한 검사를 브라우저가 아니라 데이터베이스가 합니다. 프론트엔드 코드를 고쳐도 우회되지 않아요.

## 핵심 기능과 코드

| 기능                                            | 핵심 코드                                                                                                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 마크다운 관리자 · 임시저장 미리보기             | [`components/admin/PostEditor.tsx`](components/admin/PostEditor.tsx) · [`app/admin/preview/[slug]/page.tsx`](app/admin/preview/%5Bslug%5D/page.tsx)    |
| 일정 + 글 쓴 날을 겹쳐 보는 달력                | [`lib/calendar.ts`](lib/calendar.ts) · [`components/Calendar.tsx`](components/Calendar.tsx)                                                            |
| 권한을 DB가 검사하는 인증                       | [`supabase-schema.sql`](supabase-schema.sql) (`is_owner()`) · [`lib/posts.ts`](lib/posts.ts)                                                           |
| 본문 목차 (라이브러리와 같은 규칙으로 id 생성)  | [`lib/toc.ts`](lib/toc.ts) · [`components/TableOfContents.tsx`](components/TableOfContents.tsx)                                                        |
| 검색 노출 (sitemap · RSS · JSON-LD · OG 이미지) | [`app/sitemap.ts`](app/sitemap.ts) · [`lib/feed.ts`](lib/feed.ts) · [`app/posts/[slug]/opengraph-image.tsx`](app/posts/%5Bslug%5D/opengraph-image.tsx) |
| 유튜브 배경음악 (주소 파싱)                     | [`lib/playlist.ts`](lib/playlist.ts) · [`components/MusicPlayer.tsx`](components/MusicPlayer.tsx)                                                      |
| 다크 모드 (CSS 변수 한 곳에서)                  | [`app/globals.css`](app/globals.css) · [`components/ThemeToggle.tsx`](components/ThemeToggle.tsx)                                                      |
| 보안 헤더 · CSP                                 | [`next.config.js`](next.config.js)                                                                                                                     |
| 업로드 검증 (타입 · 크기)                       | [`lib/storage.ts`](lib/storage.ts)                                                                                                                     |

## 트러블슈팅

전체 내용은 **[프로젝트 상세 페이지](https://mynameiswoo.vercel.app/projects/still-building)** 에 문제 → 원인 → 시도 → 해결 → 성과 형태로 정리해뒀습니다. 요약하면:

<details>
<summary><b>1. 관리자 인증이 브라우저 안에만 있었다</b> — 개발자 도구로 통과 가능 → RLS로 이전</summary>

- **문제** 관리자 비밀번호를 자바스크립트로 검사. 개발자 도구로 우회 가능했고, DB 정책은 "누구나 쓰기 가능"
- **원인** 인증을 화면 단에서만 함. 브라우저 검사는 잠금이 아니라 가림막
- **시도** 비밀번호를 환경변수로 이동 → `NEXT_PUBLIC_` 값은 번들에 그대로 박혀서 무의미
- **해결** Supabase Auth 로그인 + Postgres RLS `is_owner()` 정책
- **성과** 로그인한 소유자만 INSERT·UPDATE·DELETE 통과. 프론트 코드를 고쳐도 우회 불가

</details>

<details>
<summary><b>2. 달력에서 날짜가 하루씩 밀렸다</b> — UTC 해석 문제 → 테스트 13개로 고정</summary>

- **문제** 8월 19일에 쓴 글이 8월 18일 칸에 표시
- **원인** `new Date('2026-08-19')` 는 UTC 자정으로 해석됨. 한국(UTC+9)에서는 전날 15시
- **시도** `toISOString().slice(0, 10)` → 다시 UTC로 되돌리는 것이라 그대로 밀림
- **해결** 문자열을 직접 잘라 `new Date(y, m - 1, d)` 로 로컬 날짜 생성 (`parseDateKey`). UTC를 거치지 않음
- **성과** 순수 함수로 분리 + 테스트 13개. 회귀 시 CI에서 즉시 검출

</details>

<details>
<summary><b>3. DB 장애가 "쓴 글이 없음"으로 보였다</b> — 실패와 0건이 같은 값 → 3가지 화면으로 분리</summary>

- **문제** 글이 4편 있는데 "아직 작성된 글이 없어요" 표시
- **원인** 조회 실패를 `try/catch` 로 삼키고 빈 배열 반환. 실패와 "0건"이 구분되지 않음
- **시도** 콘솔 로그 추가 → 서버 로그는 방문자에게 보이지 않아 화면은 그대로
- **해결** 실패는 throw → `app/error.tsx` 가 재시도 UI 제공. 상세는 `.maybeSingle()` 로 "없는 글"과 "조회 실패" 분리
- **성과** 장애(500+재시도) / 0편(안내) / 없는 주소(404) 세 경우가 각각 다른 화면

</details>

<details>
<summary><b>4. 테스트를 쓰다가 찾은 유튜브 주소 파싱 버그</b> — 호스트 미검사 → 화이트리스트</summary>

- **문제** 유튜브가 아닌 주소도 플레이어가 생성되고 무한 로딩
- **원인** `youtubeId` 가 정규식으로 `?v=` 뒤만 자르고 호스트를 확인하지 않음
- **시도** 정규식에 `youtube` 추가 → 쿼리스트링에 `youtube` 가 든 다른 주소가 여전히 통과
- **해결** `new URL()` 파싱 + 호스트 화이트리스트. `watch?v=` · `youtu.be` · `shorts` 각각 처리
- **성과** 테스트 작성 중 발견. 파싱 테스트 10개로 고정

</details>

<details>
<summary><b>5. 다크 모드에서 댓글창만 밝게 남았다</b> — React Strict Mode 이중 실행</summary>

- **문제** 테마를 바꿔도 giscus 댓글창은 밝은 채. 동기화 코드가 아예 동작하지 않음
- **원인** Strict Mode는 effect를 두 번 실행. 스크립트가 있으면 early return 하도록 짜서, 1회차에 붙인 `MutationObserver` 가 cleanup에서 끊기고 2회차엔 다시 붙지 않음
- **시도** 주입 여부 플래그 추가 → early return 위치가 그대로여서 증상 동일
- **해결** early return 범위를 "스크립트 주입"에만 한정. 옵저버 등록은 매번 실행
- **성과** 테마 토글 시 giscus 프레임으로 `dark_dimmed` 전달 확인

</details>

<details>
<summary><b>6. 본문 글자 색이 접근성 기준 미달이었다</b> — 대비 3.1:1 → 4.7:1, 96 → 100점</summary>

- **문제** Lighthouse 접근성 96점. 날짜 · 태그 · 설명에 쓰던 흐린 회색이 대비 부족으로 검출
- **원인** `--ink-muted` 를 눈으로만 정함. 실제 대비 3.1:1 (WCAG AA 본문 기준 4.5:1)
- **시도** 글자 크기를 키워 "큰 글자" 기준(3:1)으로 통과 → 보조 정보가 커져 화면 위계가 무너짐
- **해결** 색만 조정. `--ink-muted` 4.7:1, 강조색 4.8:1. CSS 변수 한 곳이라 세 줄 수정으로 끝
- **성과** **접근성 96 → 100점.** 같은 김에 폰트 `@import` → `<link rel="preconnect">` 로 옮겨 요청 왕복 1회 감소

</details>

## 폴더 구조

```
app/                    페이지 (App Router)
  ├ page.tsx            메인 — 포트폴리오 랜딩
  ├ about/ projects/    소개 · 프로젝트 (목록 + 상세)
  ├ blog/ posts/[slug]/ 글 목록 · 글 상세
  ├ calendar/           일정 + 글 쓴 날
  ├ admin/              관리자 (로그인 · 글 · 일정 · 미리보기)
  ├ sitemap.ts robots.ts feed.xml/   검색엔진용
  └ opengraph-image.tsx              링크 미리보기 카드
components/             화면 조각 (project/ 아래는 프로젝트 상세 전용)
lib/                    순수 로직 — 날짜 · 마크다운 · RSS · 유튜브 파싱 · 프로젝트 데이터
tests/                  lib/ 순수 함수 테스트 56개
.github/workflows/ci.yml  PR마다 5단계 검사
```

프로젝트를 추가하려면 [`lib/projects.ts`](lib/projects.ts) 배열에 항목 하나를 넣으면 목록 · 상세 · 사이트맵 · 메인 개수 표시가 모두 따라갑니다.

## 개발

```bash
npm install
npm run dev           # 개발 서버
npm run format:check  # 포맷 검사
npm run lint          # 린트
npm run typecheck     # 타입 검사
npm test              # 테스트 (56개)
npm run build         # 빌드
```

---

## 직접 굴려보려면 (설치 · 운영)

### 1. Supabase 프로젝트 준비

1. https://supabase.com 에서 새 프로젝트 생성 (또는 기존 프로젝트 재사용)
2. Authentication > Users 에서 본인 계정을 하나 만들기 (이메일 + 비밀번호)
3. `supabase-schema.sql`을 열어 `is_owner()` 안의 이메일을 방금 만든 계정 이메일로 바꾸고,
   SQL Editor에서 전체 실행
4. Authentication 설정에서 **회원가입(sign up) 허용을 꺼두기** — 나만 쓰는 블로그니까요
5. Settings > API 에서 `Project URL`과 `anon public key` 복사

### 2. 환경변수 설정

`.env.local.example`을 `.env.local`로 복사하고 값을 채워넣으세요.
Vercel에 배포할 때는 Vercel 프로젝트 설정 > Environment Variables 에 동일하게 등록하면 됩니다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GISCUS_*` — (선택) 댓글 설정. 값이 이미 `lib/site.ts`에 들어 있어서
  평소에는 안 넣어도 돼요. 저장소를 옮길 때만 그 파일의 네 줄을 고치면 됩니다.
- `NEXT_PUBLIC_SITE_URL` — `https://내도메인.com`. 링크 미리보기·sitemap·검색 노출 주소의 기준이에요.
  안 넣으면 Vercel 배포 주소를 쓰는데, **검색 등록을 할 거라면 꼭 넣어주세요.** 이게 비어 있으면
  구글에 알려주는 주소와 실제 주소가 달라져서 색인이 꼬여요.
- `GOOGLE_SITE_VERIFICATION` — (선택) 구글 서치 콘솔에서 받은 소유 확인 코드
- `NAVER_SITE_VERIFICATION` — (선택) 네이버 서치어드바이저에서 받은 소유 확인 코드

### 3. GitHub 업로드 → Vercel 배포

1. 이 폴더 전체를 새 GitHub 저장소에 업로드 (브라우저에서 "Add file > Upload files" 사용 가능)
2. Vercel에서 해당 저장소 Import
3. 위 환경변수를 Vercel에 등록 후 Deploy
4. 이메일+비밀번호 로그인만 쓰기 때문에 Supabase의 리디렉션 URL 설정은 건드릴 필요 없어요

### 4. 글 쓰기 · 일정 등록

배포된 사이트의 `/admin` 경로로 접속 → Supabase에 만든 계정으로 로그인.
상단 탭에서 **글**과 **일정**을 오가며 작성/수정/삭제할 수 있어요.

> ⚠️ 이 저장소는 공개되어 있어요. SQL 파일에 실제 이메일을 적어서 커밋하면
> 크롤러가 긁어갑니다. 파일에는 `YOUR_EMAIL@example.com` 을 그대로 두고,
> SQL Editor에 **붙여넣을 때만** 본인 이메일로 바꿔서 실행하세요.

> **이미 이 블로그를 굴리고 있었다면** `supabase-migration-auth.sql`을 쓰세요.
> 파일 맨 위 `is_owner()`의 이메일만 본인 계정으로 바꾼 뒤 SQL Editor에서 실행하면,
> 예전의 '누구나 쓰기 가능' 정책이 걷히고 로그인 기반으로 바뀝니다.
> 달력을 아직 안 붙였다면 `supabase-schema.sql`의 `events` 테이블 부분도 함께 실행해주세요.

## 검색에 뜨게 하기

사이트를 올려두기만 하면 구글·네이버가 알아서 찾아오지는 않아요. **한 번은 직접 등록해줘야** 합니다.
코드 쪽 준비(sitemap, robots, 구조화 데이터, 소유 확인 태그)는 이미 다 돼 있어요.

### 구글

1. https://search.google.com/search-console 접속 → 속성 추가 → **URL 접두어**에 내 주소 입력
2. 소유권 확인 방법 중 **HTML 태그**를 고르면 `content="..."` 안에 코드가 보여요. 그 값만 복사
3. Vercel → Settings → Environment Variables 에 `GOOGLE_SITE_VERIFICATION` 으로 추가 → 재배포
4. 서치 콘솔로 돌아가 **확인** 누르기
5. 왼쪽 메뉴 Sitemaps → `sitemap.xml` 입력하고 제출

### 네이버

1. https://searchadvisor.naver.com 접속 → 웹마스터도구 → 사이트 등록
2. 소유확인에서 **HTML 태그** 방식 선택 → 코드 복사
3. Vercel에 `NAVER_SITE_VERIFICATION` 으로 추가 → 재배포 → 확인 누르기
4. 요청 → 사이트맵 제출 에 `sitemap.xml`
5. 요청 → **RSS 제출** 에 `feed.xml` — 네이버는 RSS를 꽤 많이 봐요

### 그 다음

- 색인까지 보통 **구글 며칠, 네이버 1~4주** 걸려요. 바로 안 뜬다고 잘못된 게 아니에요.
- 글이 없으면 색인할 게 없습니다. 검색 노출은 결국 글 개수와 내용이 정해요.
- 글마다 **요약을 적어두면** 그게 검색 결과의 설명 줄로 쓰여요. 안 적으면 본문 앞부분이 대신 들어갑니다.
- 잘 되고 있는지는 구글에 `site:내도메인.com` 을 검색해보면 알 수 있어요.

## 보안·개인정보

- 방문자 분석 도구, 광고, 추적 스크립트를 넣지 않았어요. 브라우저에는 다크 모드 설정과
  음악 상태만 저장되고 서버로 가지 않습니다. 자세한 건 `/privacy`에 적어뒀어요.
- 글·일정·사진을 쓰고 지우는 권한은 데이터베이스가 검사해요. 브라우저 쪽 코드를
  아무리 고쳐도 우회되지 않습니다.
- 사진 업로드는 실제 파일 타입과 크기를 확인하고, 확장자를 파일 이름이 아니라
  타입에서 가져와요. 이름만 믿으면 `사진.html` 같은 파일이 웹페이지로 열릴 수 있어요.
- 응답에 보안 헤더를 붙였습니다 (`next.config.js`). CSP는 아직 **Report-Only**라
  규칙을 어겨도 막지 않고 콘솔에만 남겨요. 실제 사이트에서 댓글·음악을 켜보고
  콘솔에 경고가 없으면 `Content-Security-Policy-Report-Only`를
  `Content-Security-Policy`로 바꾸면 진짜로 막힙니다.

## 알아두면 좋은 점

- 광고 없이 포트폴리오 목적에 집중한 구성이에요.
- 다크 모드는 헤더 오른쪽 아이콘으로 바꿔요. 처음 들어오면 기기 설정을 따라가고,
  한 번 고르면 그 선택을 기억해요. 색은 전부 `app/globals.css` 맨 위 CSS 변수에 모여 있어서
  거기 숫자만 바꾸면 사이트 전체 색이 같이 움직입니다.
- 글·일정·사진을 쓰고 지우는 건 `is_owner()`에 적힌 이메일로 로그인한 사람만 가능해요.
  검사는 브라우저가 아니라 DB가 하기 때문에, 개발자 도구로 우회할 수 없어요.
  주인을 바꾸고 싶으면 `is_owner()` 함수의 이메일만 고쳐서 다시 실행하면 됩니다.
- `app/about/page.tsx`의 이메일/GitHub 링크, 프로젝트 설명은 직접 채워넣어야 해요.
- 헤더의 "D+N" 카운터 시작일은 `components/DaysCounter.tsx`의 `LAUNCH_DATE`에서 바꿀 수 있어요.
- 본문에 ` ```ts ` 처럼 언어를 적으면 코드 블록 위에 언어 이름과 **복사 버튼**이 붙고
  문법 강조도 들어가요. 언어를 안 적으면 강조 없이 그대로 나옵니다.
  강조 색은 `app/globals.css` 아래쪽 `.hljs-*` 규칙에서 바꿀 수 있어요.
- 발행일은 직접 고를 수 있어요. 지난 날짜로 적어두면 달력에도 그 날에 찍혀요.
  글을 수정해도 발행일은 그대로 유지되고, 날짜 칸을 바꿀 때만 옮겨갑니다.
- 임시저장 글은 관리자 목록의 '미리보기'로 실제 글 화면 그대로 확인할 수 있어요.
- 달력은 등록한 일정(일정/마감/메모)과 글을 발행한 날을 한 화면에 보여줘요. 날짜를 누르면 아래에 그 날의 내용이 펼쳐지고, 글 제목을 누르면 글로 이동해요.
- 일정은 로그인 없이 누구나 볼 수 있어요. 비공개로 남기고 싶은 일정은 적지 않는 게 좋아요.
- 댓글은 giscus로 GitHub Discussions에 저장돼요. 글 주소마다 Discussion이 하나씩 생기고,
  사이트의 다크 모드 토글을 누르면 댓글창 색도 같이 바뀝니다.
- 노래는 `lib/playlist.ts`의 `PLAYLIST`에서 바꿔요. 유튜브 '공유' 주소를 그대로 붙여넣으면 되고,
  `watch?v=` · `youtu.be` · `shorts` 어느 형태든, 뒤에 `?si=...`가 붙어 있어도 알아서 영상 ID를 뽑아냅니다.
  제목은 안 적어도 돼요 — 유튜브에 올라간 영상 제목을 재생할 때 그대로 가져와서 보여줍니다.
  다르게 부르고 싶으면 `title`을 적어두면 그게 우선이에요.
  브라우저가 소리 있는 자동재생을 막기 때문에 **처음 한 번은 눌러야 소리가 나요.**
  한 번 켜두면 그 선택을 기억해서, 다음 방문 때는 바로 트는 걸 시도해요.
  '퍼가기 금지'로 걸린 영상은 자동으로 다음 곡으로 넘어가고, 글 쓰는 `/admin`에서는 안 뜹니다.
- 로고는 3안(`blocks` / `progress` / `sunset`)이 `components/Logo.tsx`에 들어 있어요.
  맨 위 `DEFAULT_MARK` 한 줄만 바꾸면 헤더 로고가 통째로 바뀝니다.
  단, 파비콘(`app/icon.svg`)과 미리보기 이미지(`app/opengraph-image.tsx`)에는 마크가 따로 그려져 있어서
  로고를 바꾸면 그 두 파일의 도형도 같이 손봐야 해요.
