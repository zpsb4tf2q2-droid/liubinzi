import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

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

export async function DELETE(request: Request, context: RouteContext): Promise<NextResponse> {
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

  await prisma.project.delete({
    where: { id: projectId }
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
