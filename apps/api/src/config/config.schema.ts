import { z } from 'zod';

export const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_HOST: z.string().default('0.0.0.0'),
  API_PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL must be defined'),
  AUTH_JWT_SECRET: z.string().min(1, 'AUTH_JWT_SECRET must be defined'),
  SESSION_HEADER_NAME: z.string().min(1).default('x-session-token')
});

export type AppConfig = z.infer<typeof configSchema>;
