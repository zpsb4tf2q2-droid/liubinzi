import { TaskStatus } from "@prisma/client";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import { badRequest, forbidden, json, notFound, unauthorized, validationError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getQueryObject, readJson } from "@/lib/request";

type RouteContext = {
  params: {
    projectId: string;
  };
};

const listTasksQuerySchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
});

const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required")
    .max(200),
  description: z
    .string()
    .trim()
    .min(1, "Description must contain at least one character")
    .max(1000)
    .optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  dueDate: z.coerce.date().optional(),
});

async function ensureProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    return { response: notFound("Project not found") } as const;
  }

  if (project.ownerId !== userId) {
    return { response: forbidden("You do not have access to this project") } as const;
  }

  return {} as const;
}

export async function GET(request: Request, context: RouteContext) {
  const session = await getSession(request);

  if (!session) {
    return unauthorized();
  }

  const query = listTasksQuerySchema.safeParse(getQueryObject(request));

  if (!query.success) {
    return validationError(query.error, "Invalid query parameters");
  }

  const { projectId } = context.params;

  const accessCheck = await ensureProjectAccess(projectId, session.userId);

  if ("response" in accessCheck) {
    return accessCheck.response;
  }

  const tasks = await prisma.task.findMany({
    where: {
      projectId,
      ...(query.data.status ? { status: query.data.status } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return json(tasks);
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getSession(request);

  if (!session) {
    return unauthorized();
  }

  const body = await readJson(request);

  if (body === undefined) {
    return badRequest("Invalid JSON body");
  }

  const parsedBody = createTaskSchema.safeParse(body);

  if (!parsedBody.success) {
    return validationError(parsedBody.error);
  }

  const { projectId } = context.params;

  const accessCheck = await ensureProjectAccess(projectId, session.userId);

  if ("response" in accessCheck) {
    return accessCheck.response;
  }

  const { title, description, status, dueDate } = parsedBody.data;

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status: status ?? TaskStatus.TODO,
      dueDate,
      projectId,
    },
  });

  return json(task, { status: 201 });
}
