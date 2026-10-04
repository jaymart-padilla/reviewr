import { UpdatePasswordForm } from '@/components/auth/update-password-form';
import { normalizeSearchParam } from '@/lib/utils';
import { paths } from '@/lib/paths';
import type { ServerSearchParams } from '@/components/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: paths.auth.updatePassword.text,
};

export default async function Page({ searchParams }: ServerSearchParams) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <UpdatePasswordForm nextUrl={normalizeSearchParam(next)} />
      </div>
    </div>
  );
}
