import { IncomingMessage } from 'http';
import { getSessionByToken } from './session';
import { getUserById, UserProfile } from './user-repository';

const extractHeaderValue = (headerValue?: string | string[]): string | null => {
  if (!headerValue) {
    return null;
  }

  if (Array.isArray(headerValue)) {
    return headerValue[0] ?? null;
  }

  return headerValue;
};

export const extractBearerToken = (headerValue?: string | string[]): string | null => {
  const value = extractHeaderValue(headerValue);

  if (!value) {
    return null;
  }

  const match = value.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return null;
  }

  return match[1].trim();
};

export const getAuthenticatedUser = async (
  req: IncomingMessage
): Promise<UserProfile | null> => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return null;
  }

  const session = await getSessionByToken(token);

  if (!session) {
    return null;
  }

  const user = await getUserById(session.userId);

  if (!user) {
    return null;
  }

  return user;
};
