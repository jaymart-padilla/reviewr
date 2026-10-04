'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { paths } from '@/lib/paths';
import { BRAND } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface LoginProps extends React.ComponentPropsWithoutRef<'div'> {
  nextUrl?: string;
}

export function LoginForm({ nextUrl, className, ...props }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      router.push(nextUrl ?? paths.workspaces.url);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>
            <BookOpen aria-hidden="true" className="mx-auto mb-4 size-7" strokeWidth={1.2} />
            <p className="text-xs font-medium tracking-widest uppercase">
              {BRAND.title} · Your next chapter
            </p>
            <h1 className="mt-5 mb-1 text-2xl">{paths.auth.login.text}</h1>
          </CardTitle>
          <CardDescription className="text-xs">
            A place to pick up where you left off
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href={`${paths.auth.forgotPassword.url}`}
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href={paths.auth.signup.url} className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
          <div className="text-center">
            <Link
              href={paths.home.url}
              className="border-book-ink/40 hover:border-book-ink hover:text-book-leaf focus-visible:outline-book-ink mt-4 inline-flex min-h-11 items-center justify-center gap-3 border-b px-1 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-8"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Return to the book
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
