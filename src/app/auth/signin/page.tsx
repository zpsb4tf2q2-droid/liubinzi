'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/button';
import FormFeedback from '@/components/ui/form-feedback';
import Input from '@/components/ui/input';
import { signInSchema, type SignInValues } from '@/lib/validators/auth';

const errorMessages: Record<string, string> = {
  CredentialsSignin: 'Invalid email or password.',
  AccessDenied: 'You do not have access to this account.',
  Default: 'Unable to sign in. Please try again.',
};

const SignInPage = (): JSX.Element => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const callbackUrl = useMemo(() => searchParams.get('callbackUrl') ?? '/', [searchParams]);
  const callbackError = useMemo(() => searchParams.get('error'), [searchParams]);

  const callbackErrorMessage = callbackError ? errorMessages[callbackError] ?? errorMessages.Default : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl,
      });

      if (!result) {
        setServerError(errorMessages.Default);
        setIsSubmitting(false);
        return;
      }

      if (result.error) {
        setServerError(errorMessages[result.error] ?? errorMessages.Default);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      console.error('Sign-in failed', error);
      setServerError(errorMessages.Default);
      setIsSubmitting(false);
    }
  });

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-500">Sign in to continue to your account.</p>
      </div>

      <form className="space-y-6" onSubmit={onSubmit} noValidate>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
              {...register('email', {
                setValueAs: (value: unknown) => (typeof value === 'string' ? value.trim() : value),
              })}
            />
            <FormFeedback message={errors.email?.message} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
            <FormFeedback message={errors.password?.message} />
          </div>
        </div>

        <div className="space-y-3">
          <FormFeedback message={serverError ?? callbackErrorMessage} />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </div>
      </form>

      <p className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
};

export default SignInPage;
