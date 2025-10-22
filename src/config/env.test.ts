import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const originalEnvObject = process.env;
const originalEnvSnapshot = { ...process.env };

describe('environment configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnvSnapshot } as NodeJS.ProcessEnv;
  });

  afterAll(() => {
    process.env = originalEnvObject;
  });

  it('parses and exports validated environment variables', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.NEXTAUTH_SECRET = 'super-secret';
    process.env.NEXTAUTH_URL = 'https://example.com';

    const { env } = await import('./env');

    expect(env).toEqual({
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      NEXTAUTH_SECRET: 'super-secret',
      NEXTAUTH_URL: 'https://example.com',
    });
  });

  it('throws a descriptive error when DATABASE_URL is missing', async () => {
    process.env.NODE_ENV = 'development';
    delete process.env.DATABASE_URL;
    process.env.NEXTAUTH_SECRET = 'super-secret';

    await expect(import('./env')).rejects.toThrow(
      'Invalid environment configuration:\nDATABASE_URL: DATABASE_URL environment variable is required',
    );
  });

  it('throws a descriptive error when NEXTAUTH_URL is missing in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.NEXTAUTH_SECRET = 'super-secret';
    delete process.env.NEXTAUTH_URL;

    await expect(import('./env')).rejects.toThrow(
      'Invalid environment configuration:\nNEXTAUTH_URL: NEXTAUTH_URL is required when NODE_ENV is set to "production"',
    );
  });

  it('throws a descriptive error when NEXTAUTH_URL is invalid', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.NEXTAUTH_SECRET = 'super-secret';
    process.env.NEXTAUTH_URL = 'not-a-url';

    await expect(import('./env')).rejects.toThrow(
      'Invalid environment configuration:\nNEXTAUTH_URL: NEXTAUTH_URL must be a valid URL',
    );
  });
});
