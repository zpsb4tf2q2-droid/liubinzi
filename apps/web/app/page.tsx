import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button, Card, CardDescription, CardTitle } from "@repo/ui";
import { env } from "@/src/env/server";
import { getServerAuthSession } from "@/src/lib/auth";

export default async function HomePage() {
  const session = await getServerAuthSession();

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col items-center justify-center gap-12 px-6 py-16">
      <section className="flex max-w-2xl flex-col items-center gap-6 text-center">
        <span className="rounded-full bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
          Passwordless authentication
        </span>
        <h1 className="text-4xl font-bold leading-tight text-slate-50 sm:text-5xl">
          {env.NEXT_PUBLIC_APP_NAME}: secure access without passwords.
        </h1>
        <p className="text-lg leading-relaxed text-slate-300">
          Sign in with a one-time magic link or your GitHub account. Your personalised dashboard keeps your
          account details in sync with our platform API.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href={session ? "/dashboard" : "/sign-in"} className="min-w-[160px]">
            <Button className="w-full">
              {session ? "Go to dashboard" : "Access the dashboard"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
          {!session ? (
            <Link href="/sign-in" className="min-w-[160px]">
              <Button variant="ghost" className="w-full">
                Sign in
              </Button>
            </Link>
          ) : null}
        </div>
      </section>

      <Card className="w-full max-w-3xl border-slate-800 bg-slate-900/60 p-8 shadow-xl shadow-slate-950/40">
        <CardTitle className="mb-2 text-left text-xl text-slate-100">
          Built for modern identity-first teams
        </CardTitle>
        <CardDescription className="text-left text-base leading-relaxed text-slate-300">
          {env.NEXT_PUBLIC_APP_NAME} combines passwordless authentication, OAuth hand-offs, and an API-driven
          dashboard. Extend it with your own providers and backend integrations to bring your team onboard
          faster than ever.
        </CardDescription>
      </Card>
    </main>
  );
}
