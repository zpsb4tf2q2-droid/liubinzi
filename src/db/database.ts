import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { createSessionToken } from '../utils/auth';

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

export type SessionRecord = {
  token: string;
  userId: string;
  createdAt: string;
};

export type DatabaseState = {
  users: UserRecord[];
  sessions: SessionRecord[];
};

const createEmptyState = (): DatabaseState => ({
  users: [],
  sessions: []
});

export class FileDatabase {
  private state: DatabaseState = createEmptyState();

  constructor(private readonly filePath = path.join(process.cwd(), 'tmp', 'test-db.json')) {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw) as DatabaseState;
      this.state = {
        users: parsed.users ?? [],
        sessions: parsed.sessions ?? []
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        this.state = createEmptyState();
        this.persist();
        return;
      }

      throw error;
    }
  }

  private persist(): void {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2), 'utf-8');
  }

  reset(state?: DatabaseState): void {
    const nextState = state ?? createEmptyState();
    this.state = {
      users: [...nextState.users],
      sessions: [...nextState.sessions]
    };
    this.persist();
  }

  getUserByEmail(email: string): UserRecord | undefined {
    return this.state.users.find((user) => user.email === email);
  }

  getUserById(id: string): UserRecord | undefined {
    return this.state.users.find((user) => user.id === id);
  }

  createUser(user: Omit<UserRecord, 'id'>): UserRecord {
    const newUser: UserRecord = {
      ...user,
      id: randomUUID()
    };
    this.state.users.push(newUser);
    this.persist();
    return newUser;
  }

  createSession(userId: string): string {
    const token = createSessionToken();
    const session: SessionRecord = {
      token,
      userId,
      createdAt: new Date().toISOString()
    };
    this.state.sessions.push(session);
    this.persist();
    return token;
  }

  getSession(token: string): SessionRecord | undefined {
    return this.state.sessions.find((session) => session.token === token);
  }

  revokeSession(token: string): void {
    this.state.sessions = this.state.sessions.filter((session) => session.token !== token);
    this.persist();
  }
}

export const database = new FileDatabase();
