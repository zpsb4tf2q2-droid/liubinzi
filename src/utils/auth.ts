import { createHash, randomUUID } from 'crypto';

export const hashPassword = (password: string): string => {
  return createHash('sha256').update(password).digest('hex');
};

export const verifyPassword = (password: string, passwordHash: string): boolean => {
  return hashPassword(password) === passwordHash;
};

export const createSessionToken = (): string => {
  return randomUUID();
};
