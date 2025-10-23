import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { createProjectSchema } from '@/validation/project';

function requireUserId(request: Request): { userId: string } | { response: NextResponse } {
  const userId = request.headers.get('x-user-id');

  if (!userId) {
    return {
      response: NextResponse.json(
        {
          message: 'Unauthorized'
        },
        { status: 401 }
      )
    };
  }

  return { userId };
}

export async function GET(request: Request): Promise<NextResponse> {
  const result = requireUserId(request);
  if ('response' in result) {
    return result.response;
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: result.userId },
    include: {
      tasks: {
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  return NextResponse.json({ projects }, { status: 200 });
}

export async function POST(request: Request): Promise<NextResponse> {
  const result = requireUserId(request);
  if ('response' in result) {
    return result.response;
  }

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

  const parsed = createProjectSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors
      },
      { status: 422 }
    );
  }

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      ownerId: result.userId
    }
  });

  return NextResponse.json({ project }, { status: 201 });
}
