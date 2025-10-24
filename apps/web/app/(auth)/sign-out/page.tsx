import { redirect } from "next/navigation";
import { SignOutButton } from "@/src/components/sign-out-button";
import { env } from "@/src/env/server";
import { getServerAuthSession } from "@/src/lib/auth";

export default async function SignOutPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 py-16">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center shadow-lg shadow-slate-950/40">
        <h1 className="text-2xl font-semibold text-slate-50">Sign out of {env.NEXT_PUBLIC_APP_NAME}</h1>
        <p className="text-sm text-slate-300">
          You are currently signed in as {session.user?.email ?? "unknown email"}. Select the button below to end
          the session on this device.
        </p>
        <div className="flex justify-center">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
