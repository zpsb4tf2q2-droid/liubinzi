import { json, unauthorized, validationError, badRequest } from "@/lib/http";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getQueryObject, readJson } from "@/lib/request";
import { z } from "zod";

const projectQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .min(1, "Search query must contain at least one character")
    .max(100)
    .optional(),
});

const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Project name is required")
    .max(100),
  description: z
    .string()
    .trim()
    .min(1, "Description must contain at least one character")
    .max(1000)
    .optional(),
});

export async function GET(request: Request) {
  const session = await getSession(request);

  if (!session) {
    return unauthorized();
  }

  const queryObject = getQueryObject(request);
  const parsedQuery = projectQuerySchema.safeParse(queryObject);

  if (!parsedQuery.success) {
    return validationError(parsedQuery.error, "Invalid query parameters");
  }

  const { search } = parsedQuery.data;

  const projects = await prisma.project.findMany({
    where: {
      ownerId: session.userId,
      ...(search
        ? {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return json(projects);
}

export async function POST(request: Request) {
  const session = await getSession(request);

  if (!session) {
    return unauthorized();
  }

  const body = await readJson(request);

  if (body === undefined) {
    return badRequest("Invalid JSON body");
  }

  const parsedBody = createProjectSchema.safeParse(body);

  if (!parsedBody.success) {
    return validationError(parsedBody.error);
  }

  const project = await prisma.project.create({
    data: {
      name: parsedBody.data.name,
      description: parsedBody.data.description,
      ownerId: session.userId,
    },
  });

  return json(project, { status: 201 });
}
