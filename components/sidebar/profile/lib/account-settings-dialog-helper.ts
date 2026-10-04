import { createClient } from '@/lib/supabase/client';
import type { FormData } from '@/components/sidebar/profile/types';

const supabase = createClient();

const CONSTANTS = {
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  MAX_FILE_SIZE_MB: 5,
  AVATAR_BUCKET: 'profile_avatars',
  DEFAULT_ERR_MESSAGE: 'Something went wrong. Please try again.',
};

async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${userId}/avatar.${ext}`;

  // Clean up any previous avatar(s) with a different extension
  const { data: existing } = await supabase.storage.from(CONSTANTS.AVATAR_BUCKET).list(userId);
  const stale = existing
    ?.filter((f) => f.name !== `avatar.${ext}`)
    .map((f) => `${userId}/${f.name}`);
  if (stale?.length) {
    await supabase.storage.from(CONSTANTS.AVATAR_BUCKET).remove(stale);
  }

  const { error } = await supabase.storage
    .from(CONSTANTS.AVATAR_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;

  const { data } = supabase.storage.from(CONSTANTS.AVATAR_BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`; // cache-bust: adding different image url query prevents the browser from serving a cached image.
}

async function updateProfile(
  userId: string,
  data: { name: string; avatar: string | null }
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ ...data })
    .eq('id', userId);

  if (error) throw error;
}

async function updateEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    email: email.trim(),
  });

  if (error) throw error;
}

async function updatePassword(
  data: Pick<FormData, 'currentPassword' | 'newPassword' | 'confirmPassword'>
): Promise<void> {
  if (!data.currentPassword.trim()) throw new Error('Current password is required');

  if (data.newPassword !== data.confirmPassword) throw new Error('Passwords do not match.');

  const { error } = await supabase.auth.updateUser({
    password: data.newPassword,
    current_password: data.currentPassword,
  });
  if (error) throw error;
}

export { CONSTANTS, uploadAvatar, updateProfile, updateEmail, updatePassword };
