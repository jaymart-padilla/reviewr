import { LoginForm } from '@/components/auth/login-form';
import { normalizeSearchParam } from '@/lib/utils';
import { BRAND } from '@/lib/constants';
import { paths } from '@/lib/paths';
import type { Metadata } from 'next';
import type { ServerSearchParams } from '@/components/types';

export const metadata: Metadata = {
  title: paths.auth.login.text,
  description: `Log in to ${BRAND.title}, your personal AI study assistant. Pick up where you left off and chat with reviewers built from your own documents.`,
};

export default async function Page({ searchParams }: ServerSearchParams) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm nextUrl={normalizeSearchParam(next)} />
      </div>
    </div>
  );
}
