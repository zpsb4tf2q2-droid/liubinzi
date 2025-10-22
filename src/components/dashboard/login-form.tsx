'use client';

import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { loginAction } from '@/actions/auth';
import { loginSchema, type LoginFormValues } from '@/schemas/auth';

const inputBaseStyles =
  'w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60';

export default function LoginForm(): JSX.Element {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  });

  const onSubmit = (values: LoginFormValues): void => {
    setServerError(null);

    startTransition(async () => {
      const result = await loginAction(values);

      if ('error' in result) {
        setServerError(result.error);
        return;
      }

      reset();
      router.push('/dashboard');
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={inputBaseStyles}
          {...register('email')}
          disabled={isPending}
        />
        {errors.email ? (
          <p className="text-sm text-rose-600">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-slate-700">
          Name (optional)
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          className={inputBaseStyles}
          {...register('name')}
          disabled={isPending}
        />
        {errors.name ? <p className="text-sm text-rose-600">{errors.name.message}</p> : null}
      </div>

      {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
