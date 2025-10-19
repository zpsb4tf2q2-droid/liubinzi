import { useRouter } from 'next/router';
import { useMemo } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const nextPath = useMemo(() => {
    if (typeof window === 'undefined') return '/protected';
    const url = new URL(window.location.href);
    return url.searchParams.get('next') || '/protected';
  }, [router.asPath]);

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
      <h1>Login</h1>
      <form method="POST" action={`/api/login?next=${encodeURIComponent(nextPath)}`} style={{ display: 'grid', gap: 12, maxWidth: 320 }}>
        <label>
          <div>Username</div>
          <input name="username" placeholder="demo" defaultValue="demo" />
        </label>
        <label>
          <div>Password</div>
          <input name="password" type="password" placeholder="demo" defaultValue="demo" />
        </label>
        <button type="submit">Sign in</button>
      </form>
    </main>
  );
}
