import { supabaseClient } from './supabase';

const BUCKET = 'post-images';
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * 확장자는 파일 이름이 아니라 실제 타입에서 가져와요.
 * 이름만 믿으면 `사진.html` 같은 파일이 그대로 올라가서,
 * 저장소 주소로 열었을 때 웹페이지처럼 실행될 수 있어요.
 */
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

export async function uploadImage(file: File): Promise<string> {
  const ext = ALLOWED_TYPES[file.type];
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
