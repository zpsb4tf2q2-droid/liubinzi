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
import { signUpSchema, type SignUpValues } from '@/lib/validators/auth';

const SignUpPage = (): JSX.Element => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = useMemo(() => searchParams.get('callbackUrl') ?? '/', [searchParams]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: undefined,
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const payload = {
      name: values.name?.trim() || undefined,
      email: values.email.trim(),
      password: values.password,
    };

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let responseData: { message?: string; errors?: Record<string, string[]> } | null = null;

      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }

      if (!response.ok) {
        const fieldErrorMessage = responseData?.errors
          ? Object.values(responseData.errors)[0]?.[0]
          : undefined;
        setServerError(fieldErrorMessage ?? responseData?.message ?? 'Unable to create account.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage('Account created successfully. Signing you in...');

      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl,
      });

      if (!result || result.error) {
        setSuccessMessage(null);
        setServerError('Account created, but we could not sign you in. Please try logging in.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      console.error('Sign-up failed', error);
      setServerError('Unable to create account. Please try again.');
      setIsSubmitting(false);
    }
  });

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-500">Join now to access the full experience.</p>
      </div>

      <form className="space-y-6" onSubmit={onSubmit} noValidate>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium text-slate-700">
              Name <span className="text-xs font-normal text-slate-400">(optional)</span>
            </label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              aria-invalid={Boolean(errors.name)}
              {...register('name', {
                setValueAs: (value: unknown) => {
                  if (typeof value !== 'string') {
                    return value;
                  }

                  const trimmed = value.trim();
                  return trimmed.length === 0 ? undefined : trimmed;
                },
              })}
            />
            <FormFeedback message={errors.name?.message} />
          </div>

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
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
            <FormFeedback message={errors.password?.message} />
          </div>
        </div>

        <div className="space-y-3">
          <FormFeedback message={serverError} />
          <FormFeedback message={successMessage} variant="success" />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </div>
      </form>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/auth/signin" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignUpPage;
