import { Pool, PoolConfig } from 'pg';

const getDatabaseConfig = (): PoolConfig => {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
    };
  }

  const host = process.env.DATABASE_HOST ?? 'localhost';
  const port = Number(process.env.DATABASE_PORT ?? 5432);
  const database = process.env.DATABASE_NAME ?? 'app';
  const user = process.env.DATABASE_USER ?? 'app';
  const password = process.env.DATABASE_PASSWORD ?? 'app';

  return {
    host,
    port,
    database,
    user,
    password,
  };
};

const pool = new Pool(getDatabaseConfig());

export const getDatabasePool = (): Pool => pool;

export const assertDatabaseConnection = async (): Promise<void> => {
  await pool.query('SELECT 1');
};

export const closeDatabasePool = (): Promise<void> => pool.end();
