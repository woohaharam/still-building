-- STILL BUILDING 블로그 - Supabase 스키마
-- Supabase 프로젝트 > SQL Editor 에서 실행하세요.

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text not null,
  tags text[] default '{}',
  cover_image_url text,
  published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists posts_published_idx on posts (published, published_at desc);
create index if not exists posts_slug_idx on posts (slug);

alter table posts enable row level security;

-- 공개 조회: 발행된 글만 누구나 읽을 수 있음
create policy "public can read published posts"
  on posts for select
  using (published = true);

-- ⚠️ 아래 정책들은 관리자 페이지의 '비밀번호 입력' UI만 막아둔 것이지,
-- 실제로는 anon key를 가진 누구나 호출할 수 있는 상태예요.
-- (가족 블로그와 동일한 방식의 MVP용 보안 수준입니다.)
-- 나중에 더 안전하게 만들고 싶다면 Supabase Auth로 로그인 기반 정책으로 바꾸는 걸 추천해요.
create policy "anyone with anon key can manage posts (MVP)"
  on posts for all
  using (true)
  with check (true);

-- ────────────────────────────────────────────────
-- 달력용 일정 테이블
-- ────────────────────────────────────────────────

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_date date not null,
  end_date date,              -- 여러 날에 걸친 일정일 때만 사용
  start_time text,            -- 'HH:MM', 시간 없는 종일 일정이면 null
  kind text not null default 'plan' check (kind in ('plan', 'deadline', 'note')),
  created_at timestamptz default now()
);

create index if not exists events_start_date_idx on events (start_date);

alter table events enable row level security;

-- 공개 조회: 일정은 누구나 읽을 수 있음
create policy "public can read events"
  on events for select
  using (true);

-- ⚠️ posts 테이블과 동일한 MVP 수준의 정책이에요.
-- anon key를 가진 누구나 일정을 추가/수정/삭제할 수 있는 상태입니다.
create policy "anyone with anon key can manage events (MVP)"
  on events for all
  using (true)
  with check (true);
