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

-- ⚠️ 아래 이메일을 본인 Supabase 계정 이메일로 바꿔주세요.
-- 이 이메일로 로그인한 사람만 글과 일정을 쓰고 지울 수 있어요.
create or replace function public.is_owner()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'pmypmy1234567@naver.com';
$$;

grant execute on function public.is_owner() to anon, authenticated;

-- 주인은 임시저장 글까지 전부 읽고 쓸 수 있음
create policy "owner can manage posts"
  on posts for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

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

create policy "owner can manage events"
  on events for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- ────────────────────────────────────────────────
-- 이미지 업로드 (Storage) — 'post-images' 버킷을 먼저 만들어주세요
-- ────────────────────────────────────────────────

create policy "public can read post images"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "owner can upload post images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'post-images' and public.is_owner());

create policy "owner can update post images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'post-images' and public.is_owner());

create policy "owner can delete post images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'post-images' and public.is_owner());
