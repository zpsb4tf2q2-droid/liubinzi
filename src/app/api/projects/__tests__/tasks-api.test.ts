import { TaskStatus, type Task } from "@prisma/client";
import { vi } from "vitest";

import { POST as createTask, GET as listTasks } from "@/app/api/projects/[projectId]/tasks/route";
import {
  DELETE as deleteTask,
  GET as getTask,
  PATCH as updateTask,
} from "@/app/api/projects/[projectId]/tasks/[taskId]/route";

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
  project: {
    findUnique: vi.fn(),
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

function buildTask(overrides: Partial<Task & { project?: { id: string; ownerId: string } }> = {}): Task & {
  project?: { id: string; ownerId: string };
} {
  const now = new Date();

  return {
    id: "task-1",
    title: "Sample Task",
    description: "A sample task",
    status: TaskStatus.TODO,
    dueDate: null,
    projectId: "project-1",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("Project task routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    prismaMock.user.findUnique.mockImplementation(async ({ where }: any) => {
      if ("id" in where && where.id === defaultUser.id) {
        return { id: defaultUser.id };
      }

      return null;
    });
  });

  it("creates a task when payload is valid", async () => {
    prismaMock.project.findUnique.mockResolvedValueOnce({ ownerId: defaultUser.id });

    const createdTask = buildTask({
      title: "Implement auth",
      status: TaskStatus.IN_PROGRESS,
      dueDate: new Date("2024-12-01T00:00:00.000Z"),
    });

    prismaMock.task.create.mockResolvedValueOnce(createdTask);

    const request = new Request("http://localhost/api/projects/project-1/tasks", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-user-id": defaultUser.id,
      },
      body: JSON.stringify({
        title: "Implement auth",
        status: TaskStatus.IN_PROGRESS,
        dueDate: "2024-12-01T00:00:00.000Z",
      }),
    });

    const response = await createTask(request, { params: { projectId: "project-1" } });

    expect(response.status).toBe(201);

    const payload = (await response.json()) as Record<string, unknown>;

    expect(payload).toMatchObject({
      id: createdTask.id,
      title: "Implement auth",
      status: TaskStatus.IN_PROGRESS,
      projectId: "project-1",
    });

    expect(prismaMock.task.create).toHaveBeenCalledTimes(1);
    const createArgs = prismaMock.task.create.mock.calls[0][0];

    expect(createArgs.data).toMatchObject({
      title: "Implement auth",
      status: TaskStatus.IN_PROGRESS,
      projectId: "project-1",
    });
    expect(createArgs.data.dueDate).toEqual(new Date("2024-12-01T00:00:00.000Z"));
    expect(createArgs.data.description).toBeUndefined();
  });

  it("returns 400 when task query parameters are invalid", async () => {
    const response = await listTasks(
      new Request("http://localhost/api/projects/project-1/tasks?status=INVALID", {
        headers: { "x-user-id": defaultUser.id },
      }),
      { params: { projectId: "project-1" } },
    );

    expect(response.status).toBe(400);
    expect(prismaMock.project.findUnique).not.toHaveBeenCalled();
  });

  it("returns 403 when accessing tasks for a project owned by another user", async () => {
    prismaMock.project.findUnique.mockResolvedValueOnce({ ownerId: "someone-else" });

    const response = await listTasks(
      new Request("http://localhost/api/projects/project-1/tasks", {
        headers: { "x-user-id": defaultUser.id },
      }),
      { params: { projectId: "project-1" } },
    );

    expect(response.status).toBe(403);
    expect(prismaMock.task.findMany).not.toHaveBeenCalled();
  });

  it("returns 404 when attempting to read a missing task", async () => {
    prismaMock.task.findUnique.mockResolvedValueOnce(null);

    const response = await getTask(
      new Request("http://localhost/api/projects/project-1/tasks/task-1", {
        headers: { "x-user-id": defaultUser.id },
      }),
      { params: { projectId: "project-1", taskId: "task-1" } },
    );

    expect(response.status).toBe(404);
  });

  it("updates a task for the authenticated user", async () => {
    const existingTask = buildTask({
      project: { id: "project-1", ownerId: defaultUser.id },
    });

    prismaMock.task.findUnique.mockResolvedValueOnce(existingTask);

    const updatedTask = buildTask({
      status: TaskStatus.DONE,
      project: { id: "project-1", ownerId: defaultUser.id },
    });

    prismaMock.task.update.mockResolvedValueOnce(updatedTask);

    const response = await updateTask(
      new Request("http://localhost/api/projects/project-1/tasks/task-1", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-user-id": defaultUser.id,
        },
        body: JSON.stringify({ status: TaskStatus.DONE }),
      }),
      { params: { projectId: "project-1", taskId: "task-1" } },
    );

    expect(response.status).toBe(200);

    const payload = (await response.json()) as Record<string, unknown>;

    expect(payload).toMatchObject({
      id: "task-1",
      status: TaskStatus.DONE,
    });
    expect(prismaMock.task.update).toHaveBeenCalledWith({
      where: { id: "task-1" },
      data: { status: TaskStatus.DONE },
    });
  });

  it("deletes a task after verifying ownership", async () => {
    const existingTask = buildTask({
      project: { id: "project-1", ownerId: defaultUser.id },
    });

    prismaMock.task.findUnique.mockResolvedValueOnce(existingTask);
    prismaMock.task.delete.mockResolvedValueOnce(existingTask);

    const response = await deleteTask(
      new Request("http://localhost/api/projects/project-1/tasks/task-1", {
        method: "DELETE",
        headers: { "x-user-id": defaultUser.id },
      }),
      { params: { projectId: "project-1", taskId: "task-1" } },
    );

    expect(response.status).toBe(204);
    expect(prismaMock.task.delete).toHaveBeenCalledWith({ where: { id: "task-1" } });
  });
});
