import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { paths } from '@/lib/paths';
import type { Tables } from '@/database.types';
import type { User } from '@supabase/supabase-js';

export type UserProfile = Tables<'profiles'> & {
  email: User['email'];
};

/**
 * Fetches the current user + profile, deduplicated per request via React cache().
 * Safe to call multiple times in the same render tree — only one DB round-trip.
 *
 * Usage in Server Components:
 *   const user = await getUser();
 */
export const getUser = cache(async (): Promise<UserProfile | null> => {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (!profile) return null;

  return {
    ...profile,
    email: user.email,
  };
});

export async function getRequiredUser(): Promise<UserProfile> {
  const user = await getUser();
  if (!user) redirect(paths.auth.login.url);
  return user;
}
