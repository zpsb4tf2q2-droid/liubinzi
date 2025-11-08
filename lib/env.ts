import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXTAUTH_URL: z.string().min(1, 'NEXTAUTH_URL is required'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),
})

export function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`)
      console.error(`Environment validation failed:\n${missingVars.join('\n')}`)
      throw new Error(`Environment validation failed:\n${missingVars.join('\n')}`)
    }
    throw error
  }
}

export function getEnv<K extends keyof z.infer<typeof envSchema>>(key: K): z.infer<typeof envSchema>[K] {
  return process.env[key] as z.infer<typeof envSchema>[K]
}
