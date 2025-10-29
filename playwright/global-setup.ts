import type { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { seedTestDatabase } from '../src/db/seed';

const databaseFilePath = path.join(process.cwd(), 'tmp', 'test-db.json');

const ensureCleanDatabaseFile = (): void => {
  if (fs.existsSync(databaseFilePath)) {
    fs.rmSync(databaseFilePath, { force: true });
  }
};

export default async function globalSetup(_config: FullConfig): Promise<void> {
  ensureCleanDatabaseFile();
  seedTestDatabase();
}
