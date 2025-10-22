import { NextResponse } from "next/server";
import { TaskStatus } from "@prisma/client";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import { badRequest, forbidden, json, notFound, unauthorized, validationError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { readJson } from "@/lib/request";

type RouteContext = {
  params: {
    projectId: string;
    taskId: string;
  };
};

const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Task title is required")
      .max(200)
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
    status: z.nativeEnum(TaskStatus).optional(),
    dueDate: z.union([z.coerce.date(), z.null()]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

async function getTaskOrResponse(projectId: string, taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        select: {
          id: true,
          ownerId: true,
        },
      },
    },
  });

  if (!task || task.projectId !== projectId) {
    return { response: notFound("Task not found") } as const;
  }

  if (task.project.ownerId !== userId) {
    return { response: forbidden("You do not have access to this task") } as const;
  }

  return { task } as const;
}

export async function GET(request: Request, context: RouteContext) {
  const session = await getSession(request);

  if (!session) {
    return unauthorized();
  }

  const { projectId, taskId } = context.params;

  const result = await getTaskOrResponse(projectId, taskId, session.userId);

  if ("response" in result) {
    return result.response;
  }

  return json(result.task);
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

  const parsedBody = updateTaskSchema.safeParse(body);

  if (!parsedBody.success) {
    return validationError(parsedBody.error);
  }

  const { projectId, taskId } = context.params;

  const accessCheck = await getTaskOrResponse(projectId, taskId, session.userId);

  if ("response" in accessCheck) {
    return accessCheck.response;
  }

  const updateData: Record<string, unknown> = {};

  if (parsedBody.data.title !== undefined) {
    updateData.title = parsedBody.data.title;
  }

  if (parsedBody.data.description !== undefined) {
    updateData.description = parsedBody.data.description ?? null;
  }

  if (parsedBody.data.status !== undefined) {
    updateData.status = parsedBody.data.status;
  }

  if (parsedBody.data.dueDate !== undefined) {
    updateData.dueDate = parsedBody.data.dueDate === null ? null : parsedBody.data.dueDate;
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
  });

  return json(updatedTask);
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await getSession(request);

  if (!session) {
    return unauthorized();
  }

  const { projectId, taskId } = context.params;

  const accessCheck = await getTaskOrResponse(projectId, taskId, session.userId);

  if ("response" in accessCheck) {
    return accessCheck.response;
  }

  await prisma.task.delete({ where: { id: taskId } });

  return new NextResponse(null, { status: 204 });
}
