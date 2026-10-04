import { SignUpForm } from '@/components/auth/sign-up-form';
import { BRAND } from '@/lib/constants';
import { paths } from '@/lib/paths';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: paths.auth.signup.text,
  description: `Create your ${BRAND.title} account and turn your own documents into an AI reviewer you can chat with. Built for students, educators, and professionals.`,
};

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
}
