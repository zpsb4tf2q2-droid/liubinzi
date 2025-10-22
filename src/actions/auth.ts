'use server';

import { prisma } from '@/lib/prisma';
import { clearSessionCookie, setSessionCookie } from '@/lib/auth';
import { loginSchema, type LoginFormValues } from '@/schemas/auth';

import type { ActionResult } from './types';

export const loginAction = async (values: LoginFormValues): Promise<ActionResult> => {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return { error: 'Invalid credentials provided.' };
  }

  const { email, name } = parsed.data;

  try {
    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: {
        name: name ?? undefined,
      },
      create: {
        email: email.toLowerCase(),
        name: name ?? undefined,
      },
    });

    setSessionCookie(user.id);
    return { success: true };
  } catch (error) {
    console.error('Failed to create session', error);
    return { error: 'Unable to sign you in at the moment. Please try again.' };
  }
};

export const logoutAction = async (): Promise<ActionResult> => {
  try {
    clearSessionCookie();
    return { success: true };
  } catch (error) {
    console.error('Failed to clear session', error);
    return { error: 'Unable to sign you out at the moment.' };
  }
};
