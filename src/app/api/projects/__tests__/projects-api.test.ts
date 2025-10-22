import { vi } from "vitest";

import { GET as listProjects, POST as createProject } from "@/app/api/projects/route";
import {
  DELETE as deleteProject,
  GET as getProject,
  PATCH as updateProject,
} from "@/app/api/projects/[projectId]/route";
import type { Project } from "@prisma/client";

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
  project: {
    findMany: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  task: {
    findMany: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

const defaultUser = { id: "user-1" };

function buildProject(overrides: Partial<Project> = {}): Project {
  const now = new Date();

  return {
    id: "project-1",
    name: "Sample Project",
    description: "A sample project",
    ownerId: defaultUser.id,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

async function parseJson(response: Response) {
  return (await response.json()) as any;
}

describe("Projects API", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    prismaMock.user.findUnique.mockImplementation(async ({ where }: any) => {
      if ("id" in where && where.id === defaultUser.id) {
        return { id: defaultUser.id };
      }

      if ("email" in where && where.email === "demo@example.com") {
        return { id: defaultUser.id };
      }

      return null;
    });
  });

  it("returns a list of projects for the authenticated user", async () => {
    const project = buildProject();
    prismaMock.project.findMany.mockResolvedValueOnce([project]);

    const request = new Request("http://localhost/api/projects", {
      method: "GET",
      headers: {
        "x-user-id": defaultUser.id,
      },
    });

    const response = await listProjects(request);

    expect(response.status).toBe(200);

    const payload = (await parseJson(response)) as Array<Record<string, unknown>>;

    expect(payload).toHaveLength(1);
    expect(payload[0]).toMatchObject({
      id: project.id,
      name: project.name,
      description: project.description,
      ownerId: project.ownerId,
    });
    expect(typeof payload[0].createdAt).toBe("string");
    expect(typeof payload[0].updatedAt).toBe("string");

    expect(prismaMock.project.findMany).toHaveBeenCalledWith({
      where: { ownerId: defaultUser.id },
      orderBy: { createdAt: "desc" },
    });
  });

  it("returns 400 for invalid project creation payload", async () => {
    const request = new Request("http://localhost/api/projects", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-user-id": defaultUser.id,
      },
      body: JSON.stringify({ description: "Missing project name" }),
    });

    const response = await createProject(request);

    expect(response.status).toBe(400);
    expect(prismaMock.project.create).not.toHaveBeenCalled();
  });

  it("returns 401 when no session is provided", async () => {
    const response = await getProject(new Request("http://localhost/api/projects/project-1"), {
      params: { projectId: "project-1" },
    });

    expect(response.status).toBe(401);
  });

  it("returns 403 when accessing a project owned by another user", async () => {
    prismaMock.project.findUnique.mockResolvedValueOnce(
      buildProject({ ownerId: "someone-else", tasks: [] } as Partial<Project>),
    );

    const response = await getProject(
      new Request("http://localhost/api/projects/project-1", {
        headers: { "x-user-id": defaultUser.id },
      }),
      {
        params: { projectId: "project-1" },
      },
    );

    expect(response.status).toBe(403);
  });

  it("updates a project with valid data", async () => {
    const project = buildProject();
    prismaMock.project.findUnique.mockResolvedValueOnce(project);
    const updatedProject = buildProject({ name: "Updated" });
    prismaMock.project.update.mockResolvedValueOnce(updatedProject);

    const response = await updateProject(
      new Request("http://localhost/api/projects/project-1", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-user-id": defaultUser.id,
        },
        body: JSON.stringify({ name: "Updated" }),
      }),
      {
        params: { projectId: "project-1" },
      },
    );

    expect(response.status).toBe(200);

    const payload = await parseJson(response);

    expect(payload).toMatchObject({
      id: updatedProject.id,
      name: "Updated",
    });
    expect(typeof payload.createdAt).toBe("string");
    expect(prismaMock.project.update).toHaveBeenCalledWith({
      where: { id: "project-1" },
      data: { name: "Updated" },
    });
  });

  it("deletes a project the user owns", async () => {
    const project = buildProject();
    prismaMock.project.findUnique.mockResolvedValueOnce(project);
    prismaMock.project.delete.mockResolvedValueOnce(project);

    const response = await deleteProject(
      new Request("http://localhost/api/projects/project-1", {
        method: "DELETE",
        headers: { "x-user-id": defaultUser.id },
      }),
      {
        params: { projectId: "project-1" },
      },
    );

    expect(response.status).toBe(204);
    expect(prismaMock.project.delete).toHaveBeenCalledWith({ where: { id: "project-1" } });
  });
});
