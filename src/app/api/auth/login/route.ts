import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { loginSchema } from '@/validation/project';

export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Invalid JSON payload'
      },
      { status: 400 }
    );
  }

  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    return NextResponse.json(
      {
        message: 'Validation failed',
        errors
      },
      { status: 422 }
    );
  }

  const { email, name } = parsed.data;

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: name ?? undefined
    },
    create: {
      email,
      name: name ?? null
    }
  });

  return NextResponse.json({ user }, { status: 200 });
}
