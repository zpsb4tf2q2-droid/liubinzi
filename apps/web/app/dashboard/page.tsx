import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardTitle } from "@repo/ui";
import { env } from "@/src/env/server";
import { getServerAuthSession } from "@/src/lib/auth";
import { SignOutButton } from "@/src/components/sign-out-button";

async function fetchProfile(cookieHeader: string) {
  const endpoint = `${env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "")}/users/me`;

  const response = await fetch(endpoint, {
    headers: {
      cookie: cookieHeader,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  return response;
}

export default async function DashboardPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/sign-in");
  }

  const cookie = headers().get("cookie") ?? "";

  let profile: Record<string, unknown> | null = null;
  let error: string | null = null;

  try {
    const response = await fetchProfile(cookie);

    if (response.status === 401) {
      redirect("/sign-in");
    }

    if (!response.ok) {
      const problem = (await response.json().catch(() => null)) as Record<string, unknown> | null;
      error = (problem?.error as string | undefined) ?? (problem?.message as string | undefined) ??
        `Failed to load profile (${response.status})`;
    } else {
      profile = (await response.json()) as Record<string, unknown>;
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to reach backend service.";
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-2 text-slate-100 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back{session.user?.name ? `, ${session.user.name}` : ""}!</h1>
          <p className="text-sm text-slate-300">
            {env.NEXT_PUBLIC_APP_NAME} keeps your authenticated session in sync with the platform API.
          </p>
        </div>
        <SignOutButton />
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardTitle className="mb-3 text-slate-100">Session details</CardTitle>
          <p className="text-sm leading-relaxed text-slate-300">
            Signed in as {session.user?.email ?? "unknown email"}.<br />
            Session expires on {new Date(session.expires).toLocaleString()}.
          </p>
        </Card>
        <Card>
          <CardTitle className="mb-3 text-slate-100">Backend profile</CardTitle>
          {error ? (
            <p className="text-sm text-rose-400">{error}</p>
          ) : profile ? (
            <pre className="overflow-x-auto rounded bg-slate-950/60 p-4 text-xs text-slate-200">
              {JSON.stringify(profile, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-slate-300">Loading profile information...</p>
          )}
        </Card>
      </section>
    </main>
  );
}
