import { ReviewrBook } from '@/app/home/components/book';
import { BRAND } from '@/lib/constants';
import { paths } from '@/lib/paths';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: paths.home.text,
  description: BRAND.description,
};

export default async function Home() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const isAuthenticated = !error && data?.claims ? true : false;

  return <ReviewrBook isAuthenticated={isAuthenticated} />;
}
