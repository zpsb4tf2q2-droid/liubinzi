import "server-only";
import { z } from "zod";

const emptyToUndefined = <T extends string | undefined | null>(value: T) =>
  value && value.length > 0 ? value : undefined;

const serverSchema = z.object({
  BACKEND_API_URL: z.string().url(),
  EMAIL_FROM: z.string().email(),
  GITHUB_ID: z
    .string()
    .optional()
    .transform((value) => emptyToUndefined(value)),
  GITHUB_SECRET: z
    .string()
    .optional()
    .transform((value) => emptyToUndefined(value)),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z
    .string()
    .url()
    .optional()
    .transform((value) => emptyToUndefined(value)),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
});

type ServerEnv = z.infer<typeof serverSchema>;
type ClientEnv = z.infer<typeof clientSchema>;

const getSanitizedProcessEnv = () => ({
  BACKEND_API_URL: process.env.BACKEND_API_URL,
  EMAIL_FROM: process.env.EMAIL_FROM,
  GITHUB_ID: process.env.GITHUB_ID,
  GITHUB_SECRET: process.env.GITHUB_SECRET,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

const formatErrors = (issues: z.ZodIssue[]) =>
  issues.map((issue) => `${issue.path.join(".") || "unknown"}: ${issue.message}`).join(", ");

const parsedEnv = (() => {
  const env = getSanitizedProcessEnv();

  const server = serverSchema.safeParse(env);
  if (!server.success) {
    throw new Error(
      `Invalid server environment variables: ${formatErrors(server.error.issues)}`,
    );
  }

  const client = clientSchema.safeParse(env);
  if (!client.success) {
    throw new Error(
      `Invalid client environment variables: ${formatErrors(client.error.issues)}`,
    );
  }

  return {
    server: server.data satisfies ServerEnv,
    client: client.data satisfies ClientEnv,
  };
})();

export const serverEnv: ServerEnv = parsedEnv.server;
export const clientEnv: ClientEnv = parsedEnv.client;
export const env: ServerEnv & ClientEnv = {
  ...parsedEnv.server,
  ...parsedEnv.client,
};
