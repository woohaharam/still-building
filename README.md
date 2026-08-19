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
- `NEXT_PUBLIC_SITE_URL` — (선택) `https://내도메인.com`. 링크 공유용 미리보기 이미지 주소를 만들 때 쓰여요.
  안 넣으면 Vercel이 준 배포 주소를 쓰기 때문에, 커스텀 도메인을 붙였다면 넣어주는 게 좋아요.

### 3. GitHub 업로드 → Vercel 배포
1. 이 폴더 전체를 새 GitHub 저장소에 업로드 (브라우저에서 "Add file > Upload files" 사용 가능)
2. Vercel에서 해당 저장소 Import
3. 위 환경변수를 Vercel에 등록 후 Deploy
4. 이메일+비밀번호 로그인만 쓰기 때문에 Supabase의 리디렉션 URL 설정은 건드릴 필요 없어요

### 4. 글 쓰기 · 일정 등록
배포된 사이트의 `/admin` 경로로 접속 → Supabase에 만든 계정으로 로그인.
상단 탭에서 **글**과 **일정**을 오가며 작성/수정/삭제할 수 있어요.

> **이미 이 블로그를 굴리고 있었다면** `supabase-migration-auth.sql`을 쓰세요.
> 파일 맨 위 `is_owner()`의 이메일만 본인 계정으로 바꾼 뒤 SQL Editor에서 실행하면,
> 예전의 '누구나 쓰기 가능' 정책이 걷히고 로그인 기반으로 바뀝니다.
> 달력을 아직 안 붙였다면 `supabase-schema.sql`의 `events` 테이블 부분도 함께 실행해주세요.

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
- `lib/site.ts` — 사이트 주소·이름 (RSS·sitemap·미리보기가 공유)
- `app/about/page.tsx` — 소개/포트폴리오 페이지 (직접 내용 채워넣기)
- `app/admin/page.tsx` — 글쓰기 관리자 페이지
- `supabase-schema.sql` — DB 스키마 (새로 시작할 때)
- `supabase-migration-auth.sql` — 기존 DB를 로그인 기반 보안으로 옮기는 1회용 스크립트

## 알아두면 좋은 점
- 광고 없이 포트폴리오 목적에 집중한 구성이에요.
- 글·일정·사진을 쓰고 지우는 건 `is_owner()`에 적힌 이메일로 로그인한 사람만 가능해요.
  검사는 브라우저가 아니라 DB가 하기 때문에, 개발자 도구로 우회할 수 없어요.
  주인을 바꾸고 싶으면 `is_owner()` 함수의 이메일만 고쳐서 다시 실행하면 됩니다.
- `app/about/page.tsx`의 이메일/GitHub 링크, 프로젝트 설명은 직접 채워넣어야 해요.
- 헤더의 "D+N" 카운터 시작일은 `components/DaysCounter.tsx`의 `LAUNCH_DATE`에서 바꿀 수 있어요.
- 달력은 등록한 일정(일정/마감/메모)과 글을 발행한 날을 한 화면에 보여줘요. 날짜를 누르면 아래에 그 날의 내용이 펼쳐지고, 글 제목을 누르면 글로 이동해요.
- 일정은 로그인 없이 누구나 볼 수 있어요. 비공개로 남기고 싶은 일정은 적지 않는 게 좋아요.
- 로고는 3안(`blocks` / `progress` / `sunset`)이 `components/Logo.tsx`에 들어 있어요.
  맨 위 `DEFAULT_MARK` 한 줄만 바꾸면 헤더 로고가 통째로 바뀝니다.
  단, 파비콘(`app/icon.svg`)과 미리보기 이미지(`app/opengraph-image.tsx`)에는 마크가 따로 그려져 있어서
  로고를 바꾸면 그 두 파일의 도형도 같이 손봐야 해요.
