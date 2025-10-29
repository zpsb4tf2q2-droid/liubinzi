"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

const registerSchema = loginSchema.extend({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
});

const credentialErrorMessages: Record<string, string> = {
  CredentialsSignin: "Invalid email or password",
  Default: "Something went wrong. Please try again.",
};

const enabledGoogleFlag = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH;
const googleAuthEnabled =
  enabledGoogleFlag === "true" || enabledGoogleFlag === "1";

interface AuthFormProps {
  mode: "login" | "register";
}

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

type FormValues = LoginValues & Partial<Pick<RegisterValues, "name">>;

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegister = mode === "register";
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [values, setValues] = useState<FormValues>({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryError = searchParams.get("error");
  const queryErrorMessage = useMemo(() => {
    if (!queryError) {
      return null;
    }

    return credentialErrorMessages[queryError] ?? credentialErrorMessages.Default;
  }, [queryError]);

  const handleChange = (field: keyof FormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors([]);
    setStatusMessage(null);

    const schema = isRegister ? registerSchema : loginSchema;
    const submission = isRegister
      ? { ...values, name: values.name ?? "" }
      : values;

    const parsed = schema.safeParse(submission);

    if (!parsed.success) {
      setErrors(parsed.error.issues.map((issue) => issue.message));
      return;
    }

    setIsSubmitting(true);

    try {
      const { email, password } = parsed.data;

      if (isRegister) {
        const registerResponse = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        });

        if (!registerResponse.ok) {
          const errorBody = (await registerResponse.json().catch(() => null)) as
            | { error?: string }
            | null;

          throw new Error(
            errorBody?.error ?? "Unable to create your account at this time."
          );
        }

        setStatusMessage("Account created successfully. Signing you in...");
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (signInResult?.error) {
        const message =
          credentialErrorMessages[signInResult.error] ??
          credentialErrorMessages.Default;
        setErrors([message]);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : credentialErrorMessages.Default;
      setErrors([message]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signIn("google", { callbackUrl });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <div className="auth-container">
        <div className="auth-header">
          <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
          <p>
            {isRegister
              ? "Enter your details to get started."
              : "Sign in to access your dashboard."}
          </p>
        </div>

        {errors.length > 0 && (
          <div className="auth-error">
            <ul>
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {queryErrorMessage && errors.length === 0 && (
          <div className="auth-error">{queryErrorMessage}</div>
        )}

        {statusMessage && <div className="auth-success">{statusMessage}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <label>
              Name
              <input
                autoComplete="name"
                name="name"
                onChange={handleChange("name")}
                value={values.name ?? ""}
                placeholder="Jane Doe"
                type="text"
              />
            </label>
          )}

          <label>
            Email
            <input
              autoComplete="email"
              inputMode="email"
              name="email"
              onChange={handleChange("email")}
              placeholder="you@example.com"
              type="email"
              value={values.email}
            />
          </label>

          <label>
            Password
            <input
              autoComplete={isRegister ? "new-password" : "current-password"}
              name="password"
              onChange={handleChange("password")}
              placeholder="••••••••"
              type="password"
              value={values.password}
            />
          </label>

          <div className="auth-actions">
            <button className="primary" disabled={isSubmitting} type="submit">
              {isSubmitting
                ? isRegister
                  ? "Creating account..."
                  : "Signing in..."
                : isRegister
                ? "Create account"
                : "Sign in"}
            </button>

            {googleAuthEnabled && (
              <button
                className="secondary"
                disabled={isSubmitting}
                onClick={handleGoogleSignIn}
                type="button"
              >
                Continue with Google
              </button>
            )}
          </div>
        </form>

        <div className="auth-footer">
          {isRegister ? (
            <>
              Already have an account? <Link href="/login">Sign in</Link>
            </>
          ) : (
            <>
              Need an account? <Link href="/register">Create one</Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
