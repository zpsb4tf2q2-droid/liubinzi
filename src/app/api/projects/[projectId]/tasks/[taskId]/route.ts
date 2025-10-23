import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { updateTaskSchema } from '@/validation/project';

type RouteContext = {
  params: {
    projectId: string;
    taskId: string;
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

async function resolveTask(taskId: string, userId: string) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        ownerId: userId
      }
    }
  });
}

export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse> {
  const result = requireUserId(request);
  if ('response' in result) {
    return result.response;
  }

  const { taskId } = context.params;

  const existingTask = await resolveTask(taskId, result.userId);

  if (!existingTask) {
    return NextResponse.json(
      {
        message: 'Task not found'
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

  const parsed = updateTaskSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors
      },
      { status: 422 }
    );
  }

  const data: Record<string, unknown> = {};

  if (parsed.data.title !== undefined) {
    data.title = parsed.data.title;
  }

  if (parsed.data.completed !== undefined) {
    data.completed = parsed.data.completed;
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data
  });

  return NextResponse.json({ task }, { status: 200 });
}

export async function DELETE(request: Request, context: RouteContext): Promise<NextResponse> {
  const result = requireUserId(request);
  if ('response' in result) {
    return result.response;
  }

  const { taskId } = context.params;

  const existingTask = await resolveTask(taskId, result.userId);

  if (!existingTask) {
    return NextResponse.json(
      {
        message: 'Task not found'
      },
      { status: 404 }
    );
  }

  await prisma.task.delete({
    where: { id: taskId }
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
