import { supabaseClient } from './supabase';

const BUCKET = 'post-images';

export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabaseClient.storage
    .from(BUCKET)
    .upload(fileName, file, { cacheControl: '3600', upsert: false });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabaseClient.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}
