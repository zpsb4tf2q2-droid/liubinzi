import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z
      .string({
        required_error: 'DATABASE_URL environment variable is required',
      })
      .min(1, 'DATABASE_URL environment variable cannot be empty'),
    NEXTAUTH_SECRET: z
      .string({
        required_error: 'NEXTAUTH_SECRET environment variable is required',
      })
      .min(1, 'NEXTAUTH_SECRET environment variable cannot be empty'),
    NEXTAUTH_URL: z
      .string({
        invalid_type_error: 'NEXTAUTH_URL must be a valid URL',
      })
      .url('NEXTAUTH_URL must be a valid URL')
      .optional(),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production' && !env.NEXTAUTH_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'NEXTAUTH_URL is required when NODE_ENV is set to "production"',
        path: ['NEXTAUTH_URL'],
      });
    }
  });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const formattedErrors = parsedEnv.error.issues
    .map((issue) => {
      const path = issue.path.join('.') || 'environment';
      return `${path}: ${issue.message}`;
    })
    .join('\n');

  throw new Error(`Invalid environment configuration:\n${formattedErrors}`);
}

export const env = parsedEnv.data;

export type Env = typeof env;
