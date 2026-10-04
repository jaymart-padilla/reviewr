'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, BookOpen, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { paths } from '@/lib/paths';
import { BRAND } from '@/lib/constants';
import { cn } from '@/lib/utils';

type FormData = {
  email: string;
  password: string;
  repeatPassword: string;
  name: string;
};

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    repeatPassword: '',
    name: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleStepOne = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.password !== formData.repeatPassword) {
      setError('Passwords do not match');
      return;
    }
    setStep(2);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { name: formData.name },
        },
      });
      if (error) throw error;

      router.push(paths.auth.signUpSuccess.url);
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
            <h1 className="mt-5 mb-1 text-2xl">{paths.auth.signup.text}</h1>
          </CardTitle>
          <CardDescription className="text-xs">
            {step === 1 ? (
              <p className="flex flex-col">
                <span>Every great story starts with a page.</span>
                <span>Account creation is coming in a future chapter</span>
              </p>
            ) : (
              'Almost there!'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleStepOne}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repeatPassword">Repeat Password</Label>
                  <div className="relative">
                    <Input
                      id="repeatPassword"
                      name="repeatPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={formData.repeatPassword}
                      onChange={handleChange}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href={paths.auth.login.url} className="underline underline-offset-4">
                  Login
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">What should we call you?</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    required
                    autoFocus
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex flex-col gap-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating an account...' : 'Sign up'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                </div>
              </div>
            </form>
          )}
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
