import { cache } from 'react';
import { PUBLIC_BUCKET } from './buckets';
import { supabaseClient } from './supabase';
import { Photo, PhotoWithUrl } from './types';

/**
 * 공개 사진의 주소.
 *
 * 네트워크를 타지 않는다. 버킷 주소에 경로를 붙이는 문자열 조합이라
 * 서버에서도 브라우저에서도 그냥 부를 수 있다.
 */
export function publicPhotoUrl(path: string): string {
  return supabaseClient.storage.from(PUBLIC_BUCKET).getPublicUrl(path).data
    .publicUrl;
}

/**
 * 공개 사진첩.
 *
 * album 을 여기서도 거른다. RLS 가 이미 빼주므로 평소에는 없어도 같은 결과가
 * 나오지만, 사진은 글과 달라서 한 번 새면 주워담을 수가 없다. 정책을 잘못
 * 건드리거나 이 조회가 언젠가 서버 키를 쓰게 되면 — 서버 키는 RLS 를
 * 지나친다 — 비공개 사진이 그대로 목록에 실린다.
 *
 * 조건이 한 줄 겹치는 값으로 그 경우를 막는다.
 */
export const getPublicPhotos = cache(async function getPublicPhotos(): Promise<
  PhotoWithUrl[]
> {
  const { data, error } = await supabaseClient
    .from('photos')
    .select('*')
    .eq('album', 'public')
    .order('taken_on', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`사진을 불러오지 못했어요: ${error.message}`);
  }

  return (data as Photo[]).map((photo) => ({
    ...photo,
    url: publicPhotoUrl(photo.image_path),
  }));
});

/**
 * 비공개 사진첩 열기.
 *
 * 비밀번호를 브라우저에서 맞춰보는 게 아니다. 서버로 보내면 서버가 DB 함수로
 * 대조하고, 통과한 경우에만 사진마다 한 시간짜리 임시 주소를 발급해서
 * 돌려준다. 그 발급에는 서버 전용 키가 필요해서 브라우저에서는 할 수 없다.
 */
export async function openPrivatePhotos(
  password: string
): Promise<PhotoWithUrl[]> {
  const response = await fetch('/api/photos/private', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || '지금은 열 수 없어요.');
  }

  return (body?.photos ?? []) as PhotoWithUrl[];
}
