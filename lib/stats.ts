import { supabaseClient } from './supabase';

/**
 * 조회수·공유수.
 *
 * posts 테이블에 UPDATE 권한을 주면 방문자가 제목이나 본문까지 고칠 수 있다.
 * 그래서 숫자를 1 올리는 함수 두 개만 열어두고 그것만 부른다
 * (supabase-migration-counts-diary.sql).
 */

/** 새로고침만 해도 숫자가 오르면 의미가 없어서, 탭 단위로 한 번만 센다. */
function alreadyCounted(key: string) {
  try {
    if (sessionStorage.getItem(key)) return true;
    sessionStorage.setItem(key, '1');
    return false;
  } catch {
    // 사이트 데이터를 막아둔 브라우저에서는 그냥 세고 넘어간다.
    return false;
  }
}

export async function countView(slug: string) {
  if (alreadyCounted(`viewed:${slug}`)) return;
  await bump('increment_post_view', slug);
}

export async function countShare(slug: string) {
  await bump('increment_post_share', slug);
}

/**
 * 숫자 하나 못 올렸다고 글 읽는 데 지장을 주면 안 된다.
 * 마이그레이션을 아직 안 돌렸으면 함수가 없어서 실패하는데 그것도 조용히 넘긴다.
 */
async function bump(fn: string, slug: string) {
  try {
    await supabaseClient.rpc(fn, { p_slug: slug });
  } catch {
    // 무시
  }
}
