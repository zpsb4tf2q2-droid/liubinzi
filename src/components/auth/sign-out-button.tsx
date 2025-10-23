'use client';

import { signOut } from 'next-auth/react';

export default function SignOutButton(): JSX.Element {
  const handleSignOut = (): void => {
    void signOut({ callbackUrl: '/' });
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
    >
      Sign out
    </button>
  );
}
