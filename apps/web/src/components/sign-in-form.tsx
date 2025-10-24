"use client";

import { useState, useTransition, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { Button, Input, Card, CardHeader, CardDescription, CardTitle } from "@repo/ui";
import { publicEnv } from "@/src/env/public";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setMessage("");

    if (!email) {
      setStatus("error");
      setMessage("Email address is required");
      return;
    }

    startTransition(async () => {
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setStatus("error");
        setMessage(result.error);
        return;
      }

      setStatus("success");
      setMessage(
        `We sent a magic link to ${email}. Open it from the same device to access ${publicEnv.NEXT_PUBLIC_APP_NAME}.`,
      );
    });
  };

  const handleGitHubLogin = () => {
    void signIn("github", { callbackUrl: "/dashboard" });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in to {publicEnv.NEXT_PUBLIC_APP_NAME}</CardTitle>
        <CardDescription>
          Use a passwordless magic link emailed to you or continue with GitHub.
        </CardDescription>
      </CardHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200" htmlFor="email">
            Work email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Sending magic link..." : "Send magic link"}
        </Button>
        <div className="relative text-center text-xs uppercase tracking-wide text-slate-400">
          <span className="bg-slate-900 px-4">or</span>
          <div className="absolute left-0 top-1/2 w-full -translate-y-1/2 border-t border-slate-800" />
        </div>
        <Button type="button" variant="secondary" className="w-full" onClick={handleGitHubLogin}>
          Continue with GitHub
        </Button>
        {status !== "idle" ? (
          <p
            aria-live="polite"
            className={status === "success" ? "text-sm text-emerald-400" : "text-sm text-rose-400"}
          >
            {message}
          </p>
        ) : null}
      </form>
    </Card>
  );
}
