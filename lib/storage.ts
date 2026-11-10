import { PUBLIC_BUCKET } from './buckets';
import { supabaseClient } from './supabase';
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * 확장자는 파일 이름이 아니라 실제 타입에서 가져온다.
 * 이름만 믿으면 `사진.html` 같은 파일이 그대로 올라가서,
 * 저장소 주소로 열었을 때 웹페이지처럼 실행될 수 있다.
 */
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

/**
 * 허용 목록에 실제로 들어 있는 타입인지.
 *
 * ALLOWED_TYPES[file.type] 로 바로 꺼내면 안 된다. file.type 이
 * "constructor" 같은 값이면 프로토타입에서 함수가 딸려 나와서, 이미지가
 * 아닌데도 통과해버린다.
 */
function extensionFor(type: string): string | null {
  return Object.prototype.hasOwnProperty.call(ALLOWED_TYPES, type)
    ? ALLOWED_TYPES[type]
    : null;
}

export async function uploadImage(file: File): Promise<string> {
  const ext = extensionFor(file.type);
  if (!ext) {
    throw new Error('이미지 파일만 올릴 수 있어요 (jpg, png, webp, gif, avif)');
  }

  if (file.size > MAX_BYTES) {
    throw new Error(
      `파일이 너무 커요. ${MAX_BYTES / 1024 / 1024}MB 아래로 줄여주세요.`
    );
  }

  const fileName = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabaseClient.storage
    .from(PUBLIC_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabaseClient.storage
    .from(PUBLIC_BUCKET)
    .getPublicUrl(fileName);
  return data.publicUrl;
}

/**
 * 사진첩에 올린다. 돌려주는 건 전체 주소가 아니라 버킷 안의 경로다.
 *
 * 비공개 사진은 주소가 한 시간마다 달라져서 적어둘 수가 없다. 공개 사진도
 * 같은 모양으로 담아야 표가 한 가지 뜻만 갖는다 (lib/types.ts 의 image_path).
 *
 * 검사는 uploadImage 와 같은 것을 쓴다. 비공개 버킷이라고 느슨하게 두면,
 * 임시 주소로 열렸을 때 사진인 줄 알았던 파일이 웹페이지로 실행된다.
 */
export async function uploadPhoto(file: File, bucket: string): Promise<string> {
  const ext = extensionFor(file.type);
  if (!ext) {
    throw new Error('이미지 파일만 올릴 수 있어요 (jpg, png, webp, gif, avif)');
  }

  if (file.size > MAX_BYTES) {
    throw new Error(
      `파일이 너무 커요. ${MAX_BYTES / 1024 / 1024}MB 아래로 줄여주세요.`
    );
  }

  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabaseClient.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}
