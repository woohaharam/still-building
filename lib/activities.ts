import { cache } from 'react';
import { supabaseClient } from './supabase';
import { Activity } from './types';

/**
 * 발행한 활동만.
 *
 * 실패해도 던지지 않는다. 이 목록은 프로젝트 페이지에 곁들여 붙는 자리라,
 * 못 불러왔다고 프로젝트까지 에러 화면으로 덮을 이유가 없다.
 *
 * 순수 계산은 lib/activity.ts 에 있다. 여기 두면 테스트가 Supabase
 * 클라이언트를 끌고 들어와 환경변수 없이 터진다.
 */
export const getActivities = cache(async function getActivities(): Promise<
  Activity[]
> {
  const { data, error } = await supabaseClient
    .from('activities')
    .select('*')
    .eq('published', true)
    .order('started_on', { ascending: false });

  if (error) {
    console.error('활동 기록을 불러오지 못했어요:', error.message);
    return [];
  }

  return data as Activity[];
});
