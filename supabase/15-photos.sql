-- 사진첩 (공개 · 비공개) ------------------------------------------------------
--
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행한다. 여러 번 돌려도 괜찮다.
-- 맨 아래 '비밀번호 설정'만 값을 바꿔서 실행할 것.
--
-- 비공개 사진은 두 겹으로 막는다.
--
--   1. 표의 행   — RLS 가 album = 'private' 을 공개 목록에서 뺀다.
--   2. 사진 파일 — 따로 만든 private-photos 버킷에 넣는다. 이 버킷은 읽기가
--                  주인에게만 열려 있어서, 주소를 알아도 열리지 않는다.
--
-- 2번이 없으면 1번은 소용이 없다. post-images 버킷은 select 정책이
-- bucket_id 만 보기 때문에(01-schema.sql), anon 키로 파일 목록을 통째로 뽑을
-- 수 있다. anon 키는 페이지 소스에 그대로 있다. 거기 비공개 사진을 넣으면
-- 행만 숨고 사진은 다 보인다.
--
-- 비공개 사진을 화면에 띄울 때는 서버가 비밀번호를 확인한 뒤 1시간짜리
-- 임시 주소를 발급한다 (app/api/photos/private). 그래서 주소가 새어도
-- 한 시간 뒤면 죽는다.


-- 1. 사진 ---------------------------------------------------------------------

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  title text,
  caption text,
  -- 'public' 은 누구나, 'private' 은 비밀번호를 통과한 사람만.
  album text not null default 'public' check (album in ('public', 'private')),
  -- 전체 주소가 아니라 버킷 안의 경로만 담는다. 공개 사진은 경로로 주소를
  -- 만들면 되고, 비공개 사진은 그때그때 임시 주소를 발급해야 해서 전체
  -- 주소를 미리 적어둘 수가 없다.
  image_path text not null,
  -- 사진을 찍은 날. 올린 날과 다를 수 있어서 따로 받는다.
  taken_on date,
  created_at timestamptz not null default now()
);

-- 최신순으로 훑는 게 기본이라 찍은 날에 색인을 둔다.
create index if not exists photos_taken_on_idx
  on public.photos (taken_on desc nulls last, created_at desc);

alter table public.photos enable row level security;

drop policy if exists "photos_select_public" on public.photos;
create policy "photos_select_public"
  on public.photos
  for select
  using (album = 'public');

-- 로그인한 주인은 비공개 사진도 관리자 화면에서 봐야 한다.
drop policy if exists "photos_select_owner" on public.photos;
create policy "photos_select_owner"
  on public.photos
  for select
  using (public.is_owner());

drop policy if exists "photos_write_owner" on public.photos;
create policy "photos_write_owner"
  on public.photos
  for all
  using (public.is_owner())
  with check (public.is_owner());


-- 2. 비공개 사진 버킷 ----------------------------------------------------------
--
-- public = false 라 주소를 알아도 그냥은 열리지 않는다. 읽으려면 서명된
-- 임시 주소가 있어야 하고, 그건 서버만 발급할 수 있다.

insert into storage.buckets (id, name, public)
values ('private-photos', 'private-photos', false)
on conflict (id) do update set public = false;

-- 네 정책 모두 주인만. 공개 읽기 정책을 만들지 않는 것이 이 버킷의 핵심이다.
drop policy if exists "owner reads private photos" on storage.objects;
create policy "owner reads private photos"
  on storage.objects for select
  using (bucket_id = 'private-photos' and public.is_owner());

drop policy if exists "owner uploads private photos" on storage.objects;
create policy "owner uploads private photos"
  on storage.objects for insert
  with check (bucket_id = 'private-photos' and public.is_owner());

drop policy if exists "owner updates private photos" on storage.objects;
create policy "owner updates private photos"
  on storage.objects for update
  using (bucket_id = 'private-photos' and public.is_owner());

drop policy if exists "owner deletes private photos" on storage.objects;
create policy "owner deletes private photos"
  on storage.objects for delete
  using (bucket_id = 'private-photos' and public.is_owner());


-- 3. 비공개 사진첩 비밀번호 ----------------------------------------------------
--
-- 일기(02-counts-diary.sql)와 같은 방식이다. 원문이 아니라 해시로 넣고,
-- 대조는 DB 안에서 한다. 표는 RLS 를 켜고 정책을 하나도 만들지 않아서
-- anon 은 한 줄도 읽지 못한다. 아래 함수는 security definer 라 표 주인
-- 권한으로 돌기 때문에 정책에 걸리지 않는다.
-- (force row level security 는 켜면 안 된다. 켜면 함수까지 막힌다.)

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.photo_access (
  id boolean primary key default true,
  password_hash text not null,
  updated_at timestamptz not null default now(),
  constraint photo_access_single_row check (id)
);

alter table public.photo_access enable row level security;

-- 한계: 시도 횟수를 세지 않는다. 비밀번호가 짧거나 규칙적이면 반복 시도로
-- 뚫린다. 남에게 보이면 안 되는 사진이라면 길고 불규칙한 값을 쓸 것.
-- search_path 에 extensions 가 반드시 있어야 한다. crypt() 가 거기 산다.
create or replace function public.open_photos(p_password text)
returns setof public.photos
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not exists (
    select 1
      from public.photo_access
     where password_hash = crypt(p_password, password_hash)
  ) then
    raise exception '비밀번호가 맞지 않아요' using errcode = '28000';
  end if;

  return query
    select *
      from public.photos
     where album = 'private'
     order by taken_on desc nulls last, created_at desc;
end;
$$;

revoke all on function public.open_photos(text) from public;
grant execute on function public.open_photos(text) to anon, authenticated;


-- 4. 비밀번호 설정 -------------------------------------------------------------
--
-- ↓ 아래 두 문장에서 여기에_비밀번호 만 실제 값으로 바꿔서 실행할 것.
--
--   이 파일은 공개 저장소에 올라간다. 여기에 실제 비밀번호를 적으면 GitHub
--   에서 누구나 볼 수 있고, 나중에 지워도 커밋 기록에는 그대로 남는다.
--   값은 Supabase SQL Editor 창에만 붙여넣을 것.
--   바꾸고 싶을 때도 같은 문장을 다시 실행하면 된다.
--
-- 사진첩과 일기는 표가 따로다. 지금은 같은 값을 써도 나중에 한쪽만 바꿀 수
-- 있다. 둘 다 바꾸려면 두 문장을 같이 실행한다.
--
-- insert into public.photo_access (id, password_hash)
-- values (true, crypt('여기에_비밀번호', gen_salt('bf')))
-- on conflict (id) do update
--   set password_hash = excluded.password_hash,
--       updated_at = now();
--
-- insert into public.diary_access (id, password_hash)
-- values (true, crypt('여기에_비밀번호', gen_salt('bf')))
-- on conflict (id) do update
--   set password_hash = excluded.password_hash,
--       updated_at = now();


-- 5. 잘 됐는지 확인 ------------------------------------------------------------
--
-- (1) 함수가 있는지 — 1줄
-- select routine_name from information_schema.routines
--  where routine_schema = 'public' and routine_name = 'open_photos';
--
-- (2) 비밀번호가 들어갔는지 — 1이 나와야 한다
-- select count(*) from public.photo_access;
--
-- (3) 버킷이 비공개인지 — public 이 false 여야 한다
-- select id, public from storage.buckets where id = 'private-photos';
