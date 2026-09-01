-- 여행 기록 ------------------------------------------------------------------
--
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행한다.
-- 여러 번 실행해도 괜찮다.


create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  -- 다녀온 곳. '오사카', '제주' 처럼 도시나 지역 이름.
  place text not null,
  -- ISO 3166-1 alpha-2. 국기와 나라 이름을 여기서 만든다 (lib/country.ts).
  -- 나라 이름표를 따로 들고 있지 않아도 되는 대신 두 글자를 정확히 넣어야 한다.
  country_code text not null check (country_code ~ '^[A-Za-z]{2}$'),
  started_on date not null,
  -- 당일치기면 비워둔다.
  ended_on date,
  cover_image_url text,
  journal text not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  -- 끝난 날이 시작한 날보다 빠를 수는 없다.
  constraint trips_dates_in_order check (ended_on is null or ended_on >= started_on)
);

-- 목록이 started_on 으로 정렬한다.
create index if not exists trips_started_on_idx
  on public.trips (started_on desc);

alter table public.trips enable row level security;


-- 정책 -----------------------------------------------------------------------
--
-- 글·독후감과 같은 규칙이다. 방문자는 발행한 것만 읽고 쓰기는 주인만 한다.
-- 검사는 화면이 아니라 여기서 한다. anon 키는 페이지 소스에 그대로 있어서
-- 화면 쪽 조건은 아무것도 막지 못한다.

drop policy if exists "trips_select_published" on public.trips;
create policy "trips_select_published"
  on public.trips
  for select
  using (published = true);

-- 주인은 임시저장한 것까지 본다. 관리자 목록이 이 정책을 쓴다.
drop policy if exists "trips_select_owner" on public.trips;
create policy "trips_select_owner"
  on public.trips
  for select
  using (public.is_owner());

drop policy if exists "trips_manage_owner" on public.trips;
create policy "trips_manage_owner"
  on public.trips
  for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());
