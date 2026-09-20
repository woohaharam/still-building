-- 독후감 ----------------------------------------------------------------------
--
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행한다.
-- 여러 번 실행해도 괜찮다.


create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  author text not null,
  cover_image_url text,
  -- 별점. 안 매기고 넘어갈 수도 있어서 비워둘 수 있다.
  rating smallint check (rating between 1 and 5),
  review text not null,
  -- 다 읽은 날. 목록은 이 날짜 기준으로 최신순이다.
  finished_at date,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

-- 목록이 finished_at 으로 정렬하므로 인덱스를 준다.
create index if not exists books_finished_at_idx
  on public.books (finished_at desc nulls last);

alter table public.books enable row level security;


-- 정책 -----------------------------------------------------------------------
--
-- 글과 같은 규칙이다. 방문자는 발행한 것만 읽고, 쓰기는 주인만 한다.
-- 검사는 화면이 아니라 여기서 한다. anon 키는 페이지 소스에 그대로 있어서
-- 화면 쪽 조건은 아무것도 막지 못한다.

drop policy if exists "books_select_published" on public.books;
create policy "books_select_published"
  on public.books
  for select
  using (published = true);

-- 주인은 임시저장한 것까지 본다. 관리자 목록이 이 정책을 쓴다.
drop policy if exists "books_select_owner" on public.books;
create policy "books_select_owner"
  on public.books
  for select
  using (public.is_owner());

drop policy if exists "books_manage_owner" on public.books;
create policy "books_manage_owner"
  on public.books
  for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());
