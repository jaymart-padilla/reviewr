// 'use server';

// import { createClient } from '@/lib/supabase/server';
// import { revalidatePath } from 'next/cache';
// import { getErrorMessage } from '@/lib/errors';
// import { FormErrors } from '@/components/profile/types';

// export type AccountSettingsState = {
//   errors?: FormErrors;
//   success?: string;
//   avatarUrl?: string;
// };

// const CONSTANTS = {
//   ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
//   MAX_FILE_SIZE_MB: 5,
//   AVATAR_BUCKET: 'profile_avatars',
//   DEFAULT_ERR_MESSAGE: 'Something went wrong. Please try again.',
// };

// export async function updateAccountSettings(
//   prevState: AccountSettingsState,
//   formData: FormData
// ): Promise<AccountSettingsState> {
//   const supabase = await createClient();

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) return { errors: { general: 'Not authenticated.' } };

//   const name = formData.get('name')?.toString().trim();
//   const email = formData.get('email')?.toString().trim();
//   const currentPassword = formData.get('currentPassword')?.toString() ?? '';
//   const newPassword = formData.get('newPassword')?.toString() ?? '';
//   const confirmPassword = formData.get('confirmPassword')?.toString() ?? '';
//   const currentAvatarUrl = formData.get('currentAvatarUrl')?.toString() || null;

//   const avatarEntry = formData.get('avatar');
//   const hasNewAvatar = avatarEntry instanceof File && avatarEntry.size > 0;

//   const errors: AccountSettingsErrors = {};

//   if (!name) errors.name = 'Name is required.';

//   // ── Avatar upload ──
//   let avatarUrl = currentAvatarUrl;

//   if (hasNewAvatar) {
//     const file = avatarEntry as File;

//     if (!CONSTANTS.ALLOWED_MIME_TYPES.includes(file.type)) {
//       errors.avatar = 'Invalid file type. Allowed: JPEG, PNG, WebP, AVIF.';
//     } else if (file.size > CONSTANTS.MAX_FILE_SIZE_MB * 1024 * 1024) {
//       errors.avatar = `File too large. Maximum size is ${CONSTANTS.MAX_FILE_SIZE_MB} MB.`;
//     } else {
//       try {
//         const ext = file.name.split('.').pop();
//         const path = `${user.id}/avatar.${ext}`;

//         const { error } = await supabase.storage
//           .from(CONSTANTS.AVATAR_BUCKET)
//           .upload(path, file, { upsert: true, contentType: file.type });
//         if (error) throw error;

//         const { data } = supabase.storage
//           .from(CONSTANTS.AVATAR_BUCKET)
//           .getPublicUrl(path);
//         avatarUrl = `${data.publicUrl}?t=${Date.now()}`;
//       } catch (error: unknown) {
//         errors.avatar = getErrorMessage(error, CONSTANTS.DEFAULT_ERR_MESSAGE);
//       }
//     }
//   }

//   if (Object.keys(errors).length > 0) return { errors };

//   // ── Profile update ──
//   try {
//     const { error } = await supabase
//       .from('profiles')
//       .update({ name, avatar: avatarUrl })
//       .eq('id', user.id);
//     if (error) throw error;
//   } catch (error: unknown) {
//     return {
//       errors: {
//         general: getErrorMessage(error, CONSTANTS.DEFAULT_ERR_MESSAGE),
//       },
//     };
//   }

//   // ── Email update ──
//   const emailChanged = !!email && email !== user.email;
//   if (emailChanged) {
//     try {
//       const { error } = await supabase.auth.updateUser({ email });
//       if (error) throw error;
//     } catch (error: unknown) {
//       return {
//         errors: {
//           email: getErrorMessage(error, CONSTANTS.DEFAULT_ERR_MESSAGE),
//         },
//       };
//     }
//   }

//   // ── Password update ──
//   const passwordFilled = !!newPassword || !!confirmPassword;
//   if (passwordFilled) {
//     try {
//       if (!currentPassword.trim())
//         throw new Error('Current password is required.');
//       if (newPassword !== confirmPassword)
//         throw new Error('Passwords do not match.');

//       const { error } = await supabase.auth.updateUser({
//         password: newPassword,
//         current_password: currentPassword, // see note if TS complains re: types
//       });
//       if (error) throw error;
//     } catch (error: unknown) {
//       return {
//         errors: {
//           password: getErrorMessage(error, CONSTANTS.DEFAULT_ERR_MESSAGE),
//         },
//       };
//     }
//   }

//   revalidatePath('/');

//   return {
//     success: emailChanged
//       ? 'Confirmation email sent. Check both inboxes to confirm the change.'
//       : 'Profile saved.',
//     avatarUrl: avatarUrl ?? undefined,
//   };
// }
