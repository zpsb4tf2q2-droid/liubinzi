import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signUpSchema } from '@/lib/validators/auth';

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request payload' }, { status: 400 });
  }

  const parsed = signUpSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return NextResponse.json({ message: 'Validation failed', errors: fieldErrors }, { status: 400 });
  }

  const { email, password, name } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();
  const sanitizedName = name?.trim();

  try {
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existingUser) {
      return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: sanitizedName,
        passwordHash,
      },
    });

    return NextResponse.json({ message: 'Account created successfully.' }, { status: 201 });
  } catch (error) {
    console.error('Failed to create user', error);
    return NextResponse.json({ message: 'Unable to create account.' }, { status: 500 });
  }
}
