// Shared environment validation using Zod for both server and client
// Inspired by common patterns in T3-stack, adapted for plain Next.js
import { z } from 'zod';

// Define the server-side only variables
const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // Prisma / Database connectivity
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .refine((val) => /^postgres(ql)?:\/\//.test(val), {
      message: 'DATABASE_URL must be a PostgreSQL connection string starting with postgres:// or postgresql://',
    }),
  // Auth.js (NextAuth) core values
  NEXTAUTH_URL: z
    .string()
    .url('NEXTAUTH_URL must be a valid URL (e.g., http://localhost:3000)'),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
});

// Define public/client variables. Only variables prefixed with NEXT_PUBLIC_ are exposed to the browser in Next.js
const clientSchema = z.object({
  // Example public value shown in the UI (required to demonstrate validation on the client)
  NEXT_PUBLIC_SITE_NAME: z
    .string()
    .min(1, 'NEXT_PUBLIC_SITE_NAME is required and must be a non-empty string'),
});

// Utility to format Zod errors for clearer DX
function formatZodError(err) {
  try {
    return err.errors
      .map((e) => `  • ${e.path.join('.')} - ${e.message}`)
      .join('\n');
  } catch (_) {
    return String(err?.message ?? err);
  }
}

const isServer = typeof window === 'undefined';

let env;

if (isServer) {
  // Validate server and public env on the server (process.env is available here)
  const serverResult = serverSchema.safeParse(process.env);
  if (!serverResult.success) {
    const details = formatZodError(serverResult.error);
    // Print a clear error block and throw to stop the server from starting
    // eslint-disable-next-line no-console
    console.error(`\n❌ Invalid server environment variables. Fix the following issues:\n${details}\n`);
    throw new Error('Invalid server environment variables. See logs for details.');
  }

  const clientResult = clientSchema.safeParse({
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
  });
  if (!clientResult.success) {
    const details = formatZodError(clientResult.error);
    // eslint-disable-next-line no-console
    console.error(`\n❌ Invalid public (client) environment variables. Fix the following issues:\n${details}\n`);
    throw new Error('Invalid public environment variables. See logs for details.');
  }

  env = { ...serverResult.data, ...clientResult.data };
} else {
  // On the client, only validate and expose NEXT_PUBLIC_* variables
  const clientResult = clientSchema.safeParse({
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
  });
  if (!clientResult.success) {
    const details = formatZodError(clientResult.error);
    // eslint-disable-next-line no-console
    console.error(`\n❌ Invalid public (client) environment variables. Fix the following issues:\n${details}\n`);
    throw new Error('Invalid public environment variables. See logs for details.');
  }
  env = clientResult.data;
}

export { env, serverSchema, clientSchema };
