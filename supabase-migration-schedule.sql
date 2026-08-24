-- 예약 발행 -----------------------------------------------------------------
--
-- 발행 시각을 미래로 잡아두면 그때까지 글이 안 보이게 하는 정책이에요.
-- 화면 쪽에서도 거르지만, 그것만으로는 부족합니다. 누구나 anon 키로
-- Supabase에 직접 물어볼 수 있어서, 예약해둔 글이 그대로 흘러나가요.
-- 차단은 여기서 해야 합니다.
--
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요. 여러 번 실행해도
-- 괜찮습니다.

-- 기존의 '발행된 글은 누구나 읽기' 정책을 걷어냅니다.
drop policy if exists "공개된 글은 누구나 읽기" on public.posts;
drop policy if exists "Public posts are viewable by everyone" on public.posts;
drop policy if exists "posts_select_published" on public.posts;

-- 발행됐고, 발행 시각이 이미 지난 글만 공개합니다.
-- published_at이 비어 있는 옛 글은 예약이 아니므로 그대로 보여줘요.
create policy "posts_select_published"
  on public.posts
  for select
  using (
    published = true
    and (published_at is null or published_at <= now())
  );

-- 로그인한 주인은 예약 글도 봐야 하니까 따로 열어둡니다.
-- (관리자 목록과 미리보기가 이 정책을 씁니다.)
drop policy if exists "posts_select_owner" on public.posts;
create policy "posts_select_owner"
  on public.posts
  for select
  using (is_owner());
