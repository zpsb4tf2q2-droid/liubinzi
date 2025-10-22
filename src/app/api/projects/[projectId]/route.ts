import { NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import { forbidden, json, notFound, unauthorized, validationError, badRequest } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { readJson } from "@/lib/request";

type RouteContext = {
  params: {
    projectId: string;
  };
};

const updateProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Project name is required")
      .max(100)
      .optional(),
    description: z
      .union([
        z
          .string()
          .trim()
          .min(1, "Description must contain at least one character")
          .max(1000),
        z.null(),
      ])
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

async function getProjectOrResponse(projectId: string, userId: string, includeTasks = false) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: includeTasks
      ? {
          tasks: {
            orderBy: { createdAt: "desc" },
          },
        }
      : undefined,
  });

  if (!project) {
    return { response: notFound("Project not found") } as const;
  }

  if (project.ownerId !== userId) {
    return { response: forbidden("You do not have access to this project") } as const;
  }

  return { project } as const;
}

export async function GET(request: Request, context: RouteContext) {
  const session = await getSession(request);

  if (!session) {
    return unauthorized();
  }

  const { projectId } = context.params;

  const result = await getProjectOrResponse(projectId, session.userId, true);

  if ("response" in result) {
    return result.response;
  }

  return json(result.project);
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSession(request);

  if (!session) {
    return unauthorized();
  }

  const body = await readJson(request);

  if (body === undefined) {
    return badRequest("Invalid JSON body");
  }

  const parsedBody = updateProjectSchema.safeParse(body);

  if (!parsedBody.success) {
    return validationError(parsedBody.error);
  }

  const { projectId } = context.params;

  const accessCheck = await getProjectOrResponse(projectId, session.userId);

  if ("response" in accessCheck) {
    return accessCheck.response;
  }

  const updateData: Record<string, unknown> = {};

  if (parsedBody.data.name !== undefined) {
    updateData.name = parsedBody.data.name;
  }

  if (parsedBody.data.description !== undefined) {
    updateData.description = parsedBody.data.description ?? null;
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: updateData,
  });

  return json(updatedProject);
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await getSession(request);

  if (!session) {
    return unauthorized();
  }

  const { projectId } = context.params;

  const accessCheck = await getProjectOrResponse(projectId, session.userId);

  if ("response" in accessCheck) {
    return accessCheck.response;
  }

  await prisma.project.delete({ where: { id: projectId } });

  return new NextResponse(null, { status: 204 });
}
