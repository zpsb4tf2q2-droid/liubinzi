import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z
    .string()
    .trim()
    .min(1, { message: 'Name must be at least 1 character long.' })
    .max(100)
    .optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const payload = await request.json();
    const result = registerSchema.safeParse(payload);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Invalid request.',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, password, name } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'A user with this email already exists.',
        },
        { status: 409 },
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Error completing registration', error);

    return NextResponse.json(
      {
        error: 'Unable to register user at this time.',
      },
      { status: 500 },
    );
  }
}
