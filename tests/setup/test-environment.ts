import { config } from 'dotenv';
import { join } from 'node:path';

const testEnvPath = join(process.cwd(), '.env.test');
config({ path: testEnvPath, override: true });

if (process.env.TEST_DATABASE_URL && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}
