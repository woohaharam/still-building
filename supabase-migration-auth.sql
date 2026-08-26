-- ════════════════════════════════════════════════════════════
-- 관리자 인증을 Supabase Auth로 바꾸는 마이그레이션 (1회 실행)
--
-- 이전 상태: anon key만 있으면 누구나 글·일정을 쓰고 지울 수 있었다.
-- 이후 상태: 아래에 적은 '주인 이메일'로 로그인한 사람만 쓰기가 가능하다.
--
-- 실행 전에 딱 하나 바꿀 것 — 바로 아래 is_owner() 안의 이메일.
--    Supabase 대시보드 Authentication > Users 에서 만든 계정의 이메일이어야 한다.
--    안 바꾸고 실행하면 아무도 글을 못 쓰게 되니(로그인은 되는데 저장이 실패),
--    그때는 이 파일의 is_owner()만 고쳐서 다시 실행하면 된다.
-- ════════════════════════════════════════════════════════════

-- ── 1. 누가 주인인지 한 곳에서 정의 ──────────────────────────
create or replace function public.is_owner()
returns boolean
language sql
stable
as $$
  -- 이 저장소는 공개되어 있으니 실제 이메일을 여기 적어두지 말 것.
  -- SQL Editor 에 붙여넣을 때만 본인 이메일로 바꿔서 실행한다.
  select coalesce(auth.jwt() ->> 'email', '') = 'YOUR_EMAIL@example.com';
$$;

grant execute on function public.is_owner() to anon, authenticated;

-- ── 2. posts ────────────────────────────────────────────────
drop policy if exists "anyone with anon key can manage posts (MVP)" on posts;
drop policy if exists "owner can manage posts" on posts;

-- 공개 조회는 그대로: 발행된 글만 누구나 읽을 수 있음
-- (주인은 아래 정책으로 임시저장 글까지 볼 수 있다)
create policy "owner can manage posts"
  on posts for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- ── 3. events ───────────────────────────────────────────────
drop policy if exists "anyone with anon key can manage events (MVP)" on events;
drop policy if exists "owner can manage events" on events;

create policy "owner can manage events"
  on events for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- ── 4. 이미지 업로드 (Storage) ───────────────────────────────
-- 사진은 누구나 볼 수 있어야 하지만, 올리고 지우는 건 주인만.
drop policy if exists "public can read post images" on storage.objects;
drop policy if exists "owner can upload post images" on storage.objects;
drop policy if exists "owner can update post images" on storage.objects;
drop policy if exists "owner can delete post images" on storage.objects;

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

-- ── 5. 실행 후 대시보드에서 확인할 것 ────────────────────────
-- (a) Authentication > Users 에 본인 계정이 있고, 위 이메일과 같은지
-- (b) Authentication 설정에서 '회원가입(sign up) 허용'을 꺼두기
--     — 켜져 있으면 아무나 계정을 만들 수는 있다. 만들어도 is_owner()가
--       막아주지만, 애초에 못 만들게 하는 편이 깔끔하다.
-- (c) Storage > Policies 에서 예전에 만들어둔 '전부 허용' 정책이 남아 있으면 삭제
--     — 정책은 OR로 합쳐지기 때문에, 느슨한 게 하나라도 남으면 그게 이긴다.
