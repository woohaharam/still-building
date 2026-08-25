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

  if (error) {
    // 비밀번호가 틀렸을 때와 서버가 죽었을 때를 구분해서 알려준다.
    if (error.code === '28000' || /비밀번호/.test(error.message)) {
      throw new Error('비밀번호가 맞지 않아요.');
    }
    throw new Error('지금은 열 수 없어요. 잠시 뒤에 다시 시도해주세요.');
  }

  return (data ?? []) as Post[];
}
