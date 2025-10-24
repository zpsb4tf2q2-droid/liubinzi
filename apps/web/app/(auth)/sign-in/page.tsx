import { redirect } from "next/navigation";
import { SignInForm } from "@/src/components/sign-in-form";
import { env } from "@/src/env/server";
import { getServerAuthSession } from "@/src/lib/auth";

export const metadata = {
  title: `Sign in • ${env.NEXT_PUBLIC_APP_NAME}`,
};

export default async function SignInPage() {
  const session = await getServerAuthSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 py-16">
      <div className="flex w-full max-w-3xl flex-col items-center gap-8 text-center">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-slate-50">Sign in</h1>
          <p className="text-sm text-slate-300">
            We will email you a secure magic link to access {env.NEXT_PUBLIC_APP_NAME}.
          </p>
        </div>
        <SignInForm />
      </div>
    </main>
  );
}
