import { redirect } from 'next/navigation';

import LoginForm from '@/components/dashboard/login-form';
import { getCurrentUser } from '@/lib/auth';

export default async function LoginPage(): Promise<JSX.Element> {
  const user = await getCurrentUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-24">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-lg backdrop-blur">
        <header className="mb-6 flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-600">
            Sign in with your email to access your projects and manage tasks.
          </p>
        </header>
        <LoginForm />
      </section>
    </main>
  );
}
