-- 조회수·공유수 + 일기 카테고리 ------------------------------------------------
--
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행한다.
-- 여러 번 실행해도 괜찮다. 맨 아래 '비밀번호 설정'만 값을 바꿔서 실행할 것.


-- 1. 조회수와 공유수 ---------------------------------------------------------

alter table public.posts
  add column if not exists view_count integer not null default 0,
  add column if not exists share_count integer not null default 0;

-- 방문자가 posts 를 직접 UPDATE 하게 두면 제목이든 본문이든 다 고칠 수 있다.
-- 그래서 쓰기 권한은 주지 않고, 딱 이 두 함수만 열어준다.
-- security definer 라 함수 안에서만 주인 권한으로 돈다.
--
-- 한계: 이 함수는 누구나 부를 수 있고 횟수 제한이 없다. 마음먹으면 반복
-- 호출로 숫자를 부풀릴 수 있다. 막으려면 IP 단위 기록이 필요한데 그건
-- 방문자를 추적하는 일이라 이 사이트가 하지 않기로 한 것이다.
-- 그래서 이 숫자는 참고용이지 분석 지표가 아니다.

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
     and (published_at is null or published_at <= now())
     and not ('diary' = any(tags));
$$;

create or replace function public.increment_post_share(p_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.posts
     set share_count = share_count + 1
   where slug = p_slug
     and published = true
     and (published_at is null or published_at <= now())
     and not ('diary' = any(tags));
$$;

revoke all on function public.increment_post_view(text) from public;
revoke all on function public.increment_post_share(text) from public;
grant execute on function public.increment_post_view(text) to anon, authenticated;
grant execute on function public.increment_post_share(text) to anon, authenticated;


-- 2. 일기는 공개 목록에서 뺀다 -------------------------------------------------
--
-- 화면에서 비밀번호를 물어보는 것만으로는 아무것도 못 막는다. anon 키는
-- 페이지 소스에 그대로 있어서, 누구나 Supabase 에 직접 물어보면 글이 나온다.
-- 그래서 정책 자체에서 빼야 한다.

drop policy if exists "public can read published posts" on public.posts;
drop policy if exists "posts_select_published" on public.posts;

create policy "posts_select_published"
  on public.posts
  for select
  using (
    published = true
    and (published_at is null or published_at <= now())
    and not ('diary' = any(tags))
  );

-- 로그인한 주인은 일기도 예약 글도 다 봐야 한다.
drop policy if exists "posts_select_owner" on public.posts;
create policy "posts_select_owner"
  on public.posts
  for select
  using (is_owner());


-- 3. 일기 비밀번호 -----------------------------------------------------------

create extension if not exists pgcrypto;

-- 비밀번호는 원문이 아니라 해시로 넣는다. 이 표는 RLS 를 켜두고 정책을
-- 하나도 만들지 않는다. 그러면 anon 은 한 줄도 읽지 못한다. 아래 함수는
-- security definer 라 표 주인 권한으로 돌기 때문에 정책에 걸리지 않는다.
-- (force row level security 는 켜면 안 된다. 켜면 함수까지 막힌다.)
create table if not exists public.diary_access (
  id boolean primary key default true,
  password_hash text not null,
  updated_at timestamptz not null default now(),
  constraint diary_access_single_row check (id)
);

alter table public.diary_access enable row level security;

-- 한계: 시도 횟수를 세지 않는다. 비밀번호가 짧거나 규칙적이면 반복 시도로
-- 뚫린다. 남에게 보이면 안 되는 내용이라면 길고 불규칙한 값을 쓸 것.
create or replace function public.open_diary(p_password text)
returns setof public.posts
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
      from public.diary_access
     where password_hash = crypt(p_password, password_hash)
  ) then
    raise exception '비밀번호가 맞지 않아요' using errcode = '28000';
  end if;

  return query
    select *
      from public.posts
     where published = true
       and (published_at is null or published_at <= now())
       and 'diary' = any(tags)
     order by published_at desc nulls last;
end;
$$;

revoke all on function public.open_diary(text) from public;
grant execute on function public.open_diary(text) to anon, authenticated;


-- 4. 비밀번호 설정 -----------------------------------------------------------
--
-- ↓ 아래 한 줄에서 여기에_비밀번호 만 실제 값으로 바꿔서 실행할 것.
--   이 파일은 공개 저장소에 올라가니까 진짜 비밀번호를 적어두면 안 된다.
--   바꾸고 싶을 때도 같은 문장을 다시 실행하면 된다.
--
-- insert into public.diary_access (id, password_hash)
-- values (true, crypt('여기에_비밀번호', gen_salt('bf')))
-- on conflict (id) do update
--   set password_hash = excluded.password_hash,
--       updated_at = now();
