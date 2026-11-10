import { createClient } from '@supabase/supabase-js';
import { PRIVATE_BUCKET } from '@/lib/buckets';
import {
  checkRateLimit,
  clearFailures,
  clientKey,
  recordFailure,
} from '@/lib/rate-limit';
import { Photo } from '@/lib/types';

/** 임시 주소가 살아 있는 시간. 한 번 보는 동안은 넉넉하고, 새어도 곧 죽는다. */
const SIGNED_URL_SECONDS = 60 * 60;

/** 받아줄 비밀번호 길이의 위. 사람이 치는 값이라 넉넉하게 잡아도 이 정도다. */
const MAX_PASSWORD_LENGTH = 200;

export const revalidate = 0;

/**
 * 비공개 사진첩을 여는 유일한 통로.
 *
 * 브라우저에서 할 수 없는 일이 두 가지라 서버에 둔다.
 *
 *   1. 서버 전용 키를 쥐는 것. 이 키는 RLS 를 통째로 지나치므로 페이지 소스에
 *      실리면 안 된다. NEXT_PUBLIC_ 접두사가 없는 이유다.
 *   2. 비공개 버킷의 임시 주소를 발급하는 것. 그 버킷은 주인에게만 열려 있어서
 *      anon 키로는 서명할 수 없다.
 *
 * 비밀번호를 맞춰보는 일은 여기서 하지 않는다. open_photos 가 DB 안에서
 * 한다. 서버 키로 표를 직접 읽으면 RLS 를 지나쳐 버리니, 반드시 그 함수를
 * 거쳐야 비밀번호 검사가 살아 있다.
 */
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error(
      'SUPABASE_SERVICE_ROLE_KEY 가 없어서 비공개 사진을 못 엽니다'
    );
    return Response.json(
      { message: '사진첩이 아직 준비되지 않았어요. (서버 설정 필요)' },
      { status: 503 }
    );
  }

  /*
    막을 상대인지 먼저 본다. 키는 헤더에서 나오므로 몸통을 읽지 않아도
    된다 — 이미 막힌 쪽의 요청을 굳이 파싱해줄 이유가 없다.

    세는 것은 비밀번호를 실제로 틀렸을 때만 한다. 몸통이 비었거나 모양이
    틀린 요청까지 세면 실수 한 번에 열 분을 기다리게 된다.

    비밀번호 대조는 open_photos 가 하고 거기엔 횟수 제한이 없다. 재어 보니
    막지 않으면 초당 88 번까지 들어간다. 여섯 자리 숫자라면 세 시간이면
    전부 훑힌다.
  */
  // 'photo:' 를 앞에 붙여 일기와 따로 센다. 한 통로에서 틀렸다고 다른
  // 통로까지 막히면 곤란하다.
  const key = `photo:${clientKey(request)}`;
  const limit = checkRateLimit(key);

  if (!limit.allowed) {
    return Response.json(
      { message: '너무 여러 번 틀렸어요. 잠시 뒤에 다시 시도해주세요.' },
      {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSeconds) },
      }
    );
  }

  let password: unknown;
  try {
    password = (await request.json())?.password;
  } catch {
    password = undefined;
  }

  // 길이를 자른다. 사람이 외워서 치는 값이라 이보다 길 이유가 없고,
  // 막지 않으면 수 MB 짜리 문자열이 그대로 crypt() 까지 간다.
  if (
    typeof password !== 'string' ||
    !password ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return Response.json(
      { message: '비밀번호를 입력해주세요.' },
      { status: 400 }
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.rpc('open_photos', {
    p_password: password,
  });

  if (error) {
    // 28000 은 open_photos 가 비밀번호 불일치에 쓰는 코드다.
    if (error.code === '28000' || /비밀번호/.test(error.message ?? '')) {
      recordFailure(key);
      return Response.json(
        { message: '비밀번호가 맞지 않아요.' },
        { status: 401 }
      );
    }

    // 함수가 없다 — 마이그레이션을 아직 안 돌렸다.
    if (error.code === 'PGRST202' || /open_photos/.test(error.message ?? '')) {
      return Response.json(
        { message: '사진첩이 아직 준비되지 않았어요. (마이그레이션 필요)' },
        { status: 503 }
      );
    }

    console.error('open_photos 실패:', error);
    return Response.json({ message: '지금은 열 수 없어요.' }, { status: 500 });
  }

  // 맞았으니 쌓인 실패를 턴다. 안 그러면 제대로 아는 사람이 여덟 번
  // 헤매다 맞혔을 때, 다음에 와서 또 막힌다.
  clearFailures(key);

  const photos = (data ?? []) as Photo[];
  if (photos.length === 0) return Response.json({ photos: [] });

  const { data: signed, error: signError } = await supabase.storage
    .from(PRIVATE_BUCKET)
    .createSignedUrls(
      photos.map((photo) => photo.image_path),
      SIGNED_URL_SECONDS
    );

  if (signError) {
    console.error('임시 주소 발급 실패:', signError);
    return Response.json(
      { message: '사진을 불러오지 못했어요.' },
      { status: 500 }
    );
  }

  /*
    createSignedUrls 는 보낸 순서대로 돌려주지만, 한 장이 실패해도 그 자리에
    error 를 담아 나머지는 성공으로 온다. 주소가 없는 장은 화면에 깨진 칸으로
    남으므로 아예 뺀다.
  */
  const withUrl = photos
    .map((photo, index) => ({ ...photo, url: signed?.[index]?.signedUrl }))
    .filter((photo): photo is Photo & { url: string } => Boolean(photo.url));

  return Response.json({ photos: withUrl });
}
