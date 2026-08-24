import { supabaseClient } from './supabase';

const BUCKET = 'post-images';
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
 * ALLOWED_TYPES[file.type] 로 바로 꺼내면 안 됩니다. file.type 이
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
    .from(BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabaseClient.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}
