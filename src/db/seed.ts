import { hashPassword } from '../utils/auth';
import { database, DatabaseState } from './database';

export const TEST_USER_PASSWORD = 'password123';

export const TEST_USER = {
  id: 'seed-user-1',
  name: 'Seeded Tester',
  email: 'seeded.user@example.com',
  passwordHash: hashPassword(TEST_USER_PASSWORD)
};

export const TEST_USER_CREDENTIALS = {
  email: TEST_USER.email,
  password: TEST_USER_PASSWORD
};

const seededState: DatabaseState = {
  users: [TEST_USER],
  sessions: []
};

export const seedTestDatabase = (): void => {
  database.reset(seededState);
};
