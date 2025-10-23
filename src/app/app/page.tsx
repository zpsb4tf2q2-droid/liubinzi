import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import SignOutButton from '@/components/auth/sign-out-button';
import { authOptions } from '@/lib/auth';

export default async function DashboardPage(): Promise<JSX.Element> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/api/auth/signin?callbackUrl=/app');
  }

  const greetingName = session.user.name ?? session.user.email ?? 'there';

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-12">
      <section className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Dashboard</p>
        <h1 className="text-4xl font-semibold text-slate-900">Welcome back, {greetingName}!</h1>
        <p className="text-base text-slate-600">
          This route is protected by NextAuth middleware. You are seeing this because you have an active session.
        </p>
      </section>

      <section>
        <SignOutButton />
      </section>
    </main>
  );
}
