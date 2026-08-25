import { supabaseClient } from './supabase';
import { Post } from './types';

/**
 * 일기 열기.
 *
 * 비밀번호는 이 저장소 어디에도 없다. DB 안에 해시로만 들어 있고, 대조도
 * open_diary 함수가 DB 안에서 한다(supabase-migration-counts-diary.sql).
 *
 * 화면에서 비밀번호를 확인하고 목록을 감추는 방식은 아무것도 못 막는다.
 * anon 키가 페이지 소스에 그대로 있어서, 누구나 Supabase 에 직접 물어보면
 * 글이 나온다. 그래서 일기는 공개 정책에서 아예 빼두고, 이 함수로만 꺼낸다.
 */
export async function openDiary(password: string): Promise<Post[]> {
  const { data, error } = await supabaseClient.rpc('open_diary', {
    p_password: password,
  });

  if (error) throw new Error(explain(error));

  return (data ?? []) as Post[];
}

/**
 * 실패 이유를 갈라서 알려준다.
 *
 * 전부 "지금은 열 수 없어요" 로 뭉뚱그리면, 비밀번호를 틀린 건지 설정이
 * 안 끝난 건지 알 수가 없어서 고칠 데를 못 찾는다.
 */
function explain(error: { code?: string; message?: string }) {
  const code = error.code ?? '';
  const message = error.message ?? '';

  // 함수 자체가 없다 — 마이그레이션을 아직 안 돌렸다.
  if (code === 'PGRST202' || /open_diary/.test(message)) {
    return '일기 기능이 아직 준비되지 않았어요. (마이그레이션 필요)';
  }

  // crypt 를 못 찾는다 — search_path 에 extensions 가 빠졌다.
  if (code === '42883' || /crypt/.test(message)) {
    return '서버 설정이 덜 끝났어요. (pgcrypto 경로 확인 필요)';
  }

  if (code === '28000' || /비밀번호/.test(message)) {
    return '비밀번호가 맞지 않아요.';
  }

  // 남은 경우는 원인을 알 수 없으니 콘솔에 원문을 남긴다.
  if (typeof console !== 'undefined') {
    console.error('open_diary 실패:', error);
  }
  return '지금은 열 수 없어요. 잠시 뒤에 다시 시도해주세요.';
}
