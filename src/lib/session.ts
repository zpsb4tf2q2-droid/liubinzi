export interface SessionRecord {
  token: string;
  userId: string;
  expiresAt: Date;
}

export const DEMO_SESSION_TOKEN = 'demo-session-token';

const sessionStore: SessionRecord[] = [
  {
    token: DEMO_SESSION_TOKEN,
    userId: 'user-1',
    expiresAt: new Date('2099-12-31T23:59:59.999Z'),
  },
];

export const getSessionByToken = async (token: string): Promise<SessionRecord | null> => {
  const session = sessionStore.find((record) => record.token === token);

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    return null;
  }

  return session;
};
