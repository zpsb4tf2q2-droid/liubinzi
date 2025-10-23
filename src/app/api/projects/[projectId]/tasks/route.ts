import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { createTaskSchema } from '@/validation/project';

type RouteContext = {
  params: {
    projectId: string;
  };
};

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

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  const result = requireUserId(request);
  if ('response' in result) {
    return result.response;
  }

  const { projectId } = context.params;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: result.userId
    }
  });

  if (!project) {
    return NextResponse.json(
      {
        message: 'Project not found'
      },
      { status: 404 }
    );
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

  const parsed = createTaskSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors
      },
      { status: 422 }
    );
  }

  const task = await prisma.task.create({
    data: {
      title: parsed.data.title,
      projectId: projectId
    }
  });

  return NextResponse.json({ task }, { status: 201 });
}
