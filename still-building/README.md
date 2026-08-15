# STILL BUILDING

미니멀·모노톤 개발/일상 블로그. Next.js 14 + Supabase.

## 시작하기

### 1. Supabase 프로젝트 준비
1. https://supabase.com 에서 새 프로젝트 생성 (또는 기존 프로젝트 재사용)
2. SQL Editor에서 `supabase-schema.sql` 내용 실행
3. Settings > API 에서 `Project URL`과 `anon public key` 복사

### 2. 환경변수 설정
`.env.local.example`을 `.env.local`로 복사하고 값을 채워넣으세요.
Vercel에 배포할 때는 Vercel 프로젝트 설정 > Environment Variables 에 동일하게 등록하면 됩니다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_ADMIN_PASSCODE` — `/admin` 페이지 입장 비밀번호

### 3. GitHub 업로드 → Vercel 배포
1. 이 폴더 전체를 새 GitHub 저장소에 업로드 (브라우저에서 "Add file > Upload files" 사용 가능)
2. Vercel에서 해당 저장소 Import
3. 위 환경변수 3개를 Vercel에 등록 후 Deploy
4. 배포된 도메인을 Supabase Auth 리디렉션 설정에 추가할 필요는 없음 (이 프로젝트는 Supabase Auth를 쓰지 않음)

### 4. 글 쓰기
배포된 사이트의 `/admin` 경로로 접속 → 설정한 비밀번호 입력 → 글 작성/수정/삭제.

## 폴더 구조
- `app/page.tsx` — 홈 (글 목록 + 태그 필터)
- `app/posts/[slug]/page.tsx` — 글 상세
- `app/about/page.tsx` — 소개/포트폴리오 페이지 (직접 내용 채워넣기)
- `app/admin/page.tsx` — 글쓰기 관리자 페이지
- `supabase-schema.sql` — DB 스키마

## 알아두면 좋은 점
- 광고 없이 포트폴리오 목적에 집중한 구성이에요.
- `/admin`의 비밀번호는 UI 진입만 막는 수준이라, DB 자체 보안은 강하지 않아요. 개인용으로는 충분하지만, 더 단단하게 만들고 싶으면 나중에 Supabase Auth 로그인으로 바꾸는 걸 추천해요.
- `app/about/page.tsx`의 이메일/GitHub 링크, 프로젝트 설명은 직접 채워넣어야 해요.
- 헤더의 "D+N" 카운터 시작일은 `components/DaysCounter.tsx`의 `LAUNCH_DATE`에서 바꿀 수 있어요.
