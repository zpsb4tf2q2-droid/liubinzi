import crypto from 'node:crypto';
import type { User } from '@prisma/client';
import { cookies } from 'next/headers';

import { prisma } from './prisma';

export const SESSION_COOKIE_NAME = 'session_token';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

type SessionPayload = {
  userId: string;
  issuedAt: number;
};

const getSecret = (): string => {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? '';

  if (!secret) {
    console.warn(
      'AUTH_SECRET (or NEXTAUTH_SECRET) is not set. Falling back to an insecure development secret. Set AUTH_SECRET in your environment for production.'
    );
    return 'insecure-development-secret';
  }

  return secret;
};

const encodePayload = (payload: SessionPayload): string => {
  const json = JSON.stringify(payload);
  return Buffer.from(json, 'utf8').toString('base64url');
};

const signPayload = (encodedPayload: string): string => {
  return crypto.createHmac('sha256', getSecret()).update(encodedPayload).digest('base64url');
};

const safeEqual = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a, 'ascii');
  const bufB = Buffer.from(b, 'ascii');

  if (bufA.length !== bufB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
};

const decodePayload = (encodedPayload: string): SessionPayload | null => {
  try {
    const json = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const data = JSON.parse(json) as SessionPayload;

    if (typeof data?.userId !== 'string' || typeof data?.issuedAt !== 'number') {
      return null;
    }

    return data;
  } catch {
    return null;
  }
};

export const createSessionToken = (userId: string): string => {
  const payload: SessionPayload = {
    userId,
    issuedAt: Date.now(),
  };
  const encoded = encodePayload(payload);
  const signature = signPayload(encoded);
  return `${encoded}.${signature}`;
};

export const parseSessionToken = (token: string | undefined): SessionPayload | null => {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  return decodePayload(encodedPayload);
};

export type Session = SessionPayload;

export const getSession = (): Session | null => {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  return parseSessionToken(token);
};

export const getCurrentUser = async (): Promise<User | null> => {
  const session = getSession();

  if (!session) {
    return null;
  }

  return prisma.user.findUnique({ where: { id: session.userId } });
};

export const requireUser = async (): Promise<User> => {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthenticated');
  }

  return user;
};

export const setSessionCookie = (userId: string): void => {
  const cookieStore = cookies();
  const token = createSessionToken(userId);

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
};

export const clearSessionCookie = (): void => {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
};
