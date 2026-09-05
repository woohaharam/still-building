create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organizer text,
  -- 지원했지만 결과를 기다리는 것과 떨어진 것도 남긴다. 붙은 것만 적으면
  -- 몇 번 시도했는지가 사라진다.
  outcome text not null default 'applied'
    check (outcome in ('applied', 'ongoing', 'done', 'rejected')),
  started_on date not null,
  ended_on date,
  note text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  constraint activities_dates_in_order
    check (ended_on is null or ended_on >= started_on)
);

create index if not exists activities_started_on_idx
  on public.activities (started_on desc);

alter table public.activities enable row level security;


-- 정책
--
-- 글·독후감과 같은 규칙이다. 방문자는 발행한 것만 읽고 쓰기는 주인만 한다.
-- 검사는 화면이 아니라 여기서 한다. anon 키는 페이지 소스에 그대로 있어서
-- 화면 쪽 조건은 아무것도 막지 못한다.
--
-- published 기본값이 true 인 건 글과 다르다. 활동은 한 줄짜리 기록이라
-- 임시저장할 일이 드물다. 남기되 보이고 싶지 않은 항목만 꺼두면 된다.

drop policy if exists "activities_select_published" on public.activities;
create policy "activities_select_published"
  on public.activities
  for select
  using (published = true);

drop policy if exists "activities_select_owner" on public.activities;
create policy "activities_select_owner"
  on public.activities
  for select
  using (public.is_owner());

drop policy if exists "activities_manage_owner" on public.activities;
create policy "activities_manage_owner"
  on public.activities
  for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());
