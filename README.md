# STILL BUILDING

미니멀·모노톤 개발/일상 블로그. Next.js 14 + Supabase.

## 시작하기

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

## 폴더 구조
- `app/page.tsx` — 홈 (글 목록 + 태그 필터)
- `app/posts/[slug]/page.tsx` — 글 상세
- `app/calendar/page.tsx` — 달력 (등록한 일정 + 글 쓴 날)
- `components/Logo.tsx` — 사이트 로고
- `app/icon.svg` · `app/apple-icon.png` — 파비콘
- `app/opengraph-image.tsx` — 링크 공유할 때 뜨는 미리보기 이미지 (사이트 전체)
- `app/posts/[slug]/opengraph-image.tsx` — 글별 미리보기 이미지 (제목이 박힌 카드)
- `app/feed.xml/route.ts` — RSS 피드
- `app/sitemap.ts` · `app/robots.ts` — 검색엔진용
- `components/JsonLd.tsx` — 검색엔진이 읽는 구조화 데이터
- `lib/text.ts` — 마크다운에서 글자만 뽑아내기 (검색 설명·읽는 시간이 같이 씀)
- `lib/site.ts` — 사이트 주소·이름 (RSS·sitemap·미리보기가 공유)
- `lib/playlist.ts` — 배경음악 곡 목록
- `components/MusicPlayer.tsx` — 오른쪽 아래 노래 플레이어
- `app/about/page.tsx` — 소개/포트폴리오 페이지 (직접 내용 채워넣기)
- `app/admin/page.tsx` — 글쓰기 관리자 페이지
- `app/admin/preview/[slug]/page.tsx` — 임시저장 글 미리보기 (로그인해야 보여요)
- `components/PostArticle.tsx` — 글 본문 (공개 페이지와 미리보기가 같이 씀)
- `components/CodeBlock.tsx` — 코드 블록 (언어 표시 + 복사 버튼)
- `supabase-schema.sql` — DB 스키마 (새로 시작할 때)
- `supabase-migration-auth.sql` — 기존 DB를 로그인 기반 보안으로 옮기는 1회용 스크립트

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
- 본문에 ```` ```ts ```` 처럼 언어를 적으면 코드 블록 위에 언어 이름과 **복사 버튼**이 붙고
  문법 강조도 들어가요. 언어를 안 적으면 강조 없이 그대로 나옵니다.
  강조 색은 `app/globals.css` 아래쪽 `.hljs-*` 규칙에서 바꿀 수 있어요.
- 발행일은 직접 고를 수 있어요. 지난 날짜로 적어두면 달력에도 그 날에 찍혀요.
  글을 수정해도 발행일은 그대로 유지되고, 날짜 칸을 바꿀 때만 옮겨갑니다.
- 임시저장 글은 관리자 목록의 '미리보기'로 실제 글 화면 그대로 확인할 수 있어요.
- 달력은 등록한 일정(일정/마감/메모)과 글을 발행한 날을 한 화면에 보여줘요. 날짜를 누르면 아래에 그 날의 내용이 펼쳐지고, 글 제목을 누르면 글로 이동해요.
- 일정은 로그인 없이 누구나 볼 수 있어요. 비공개로 남기고 싶은 일정은 적지 않는 게 좋아요.
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
