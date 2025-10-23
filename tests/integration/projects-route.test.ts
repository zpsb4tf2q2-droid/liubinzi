import { beforeEach, afterAll, describe, expect, it } from 'vitest';

import { POST as login } from '@/app/api/auth/login/route';
import { GET as listProjects, POST as createProject } from '@/app/api/projects/route';
import { DELETE as deleteProject } from '@/app/api/projects/[projectId]/route';
import { POST as createTask } from '@/app/api/projects/[projectId]/tasks/route';
import { DELETE as removeTask, PATCH as updateTask } from '@/app/api/projects/[projectId]/tasks/[taskId]/route';
import { resetDatabase, disconnectDatabase } from '../utils/db';

const API_BASE_URL = 'http://localhost';

type NextRouteHandler<T = unknown> = Response & { json: () => Promise<T> };

type ProjectWithTasks = {
  id: string;
  name: string;
  tasks: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
};

type LoginResponse = {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
};

type CreateProjectResponse = {
  project: {
    id: string;
    name: string;
  };
};

type ListProjectsResponse = {
  projects: ProjectWithTasks[];
};

type CreateTaskResponse = {
  task: {
    id: string;
    title: string;
    completed: boolean;
  };
};

let userId: string;

async function loginUser(): Promise<void> {
  const response = (await login(
    new Request(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ email: 'integration@example.com' })
    })
  )) as NextRouteHandler<LoginResponse>;

  expect(response.status).toBe(200);
  const payload = await response.json();
  userId = payload.user.id;
}

function authenticatedRequest(path: string, init?: RequestInit): Request {
  const headers = new Headers(init?.headers);
  headers.set('x-user-id', userId);

  if (init?.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  return new Request(`${API_BASE_URL}${path}`, {
    ...init,
    headers
  });
}

describe('Projects API routes', () => {
  beforeEach(async () => {
    await resetDatabase();
    await loginUser();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it('rejects unauthenticated access', async () => {
    const response = (await listProjects(new Request(`${API_BASE_URL}/api/projects`))) as NextRouteHandler;
    expect(response.status).toBe(401);
  });

  it('allows creating and listing projects', async () => {
    const creationResponse = (await createProject(
      authenticatedRequest('/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name: 'Integration Project' })
      })
    )) as NextRouteHandler<CreateProjectResponse>;

    expect(creationResponse.status).toBe(201);

    const listResponse = (await listProjects(authenticatedRequest('/api/projects'))) as NextRouteHandler<ListProjectsResponse>;
    expect(listResponse.status).toBe(200);

    const payload = await listResponse.json();
    expect(payload.projects).toHaveLength(1);
    expect(payload.projects[0].name).toBe('Integration Project');
    expect(payload.projects[0].tasks).toHaveLength(0);
  });

  it('supports full task lifecycle within a project', async () => {
    const { project } = await (async () => {
      const response = (await createProject(
        authenticatedRequest('/api/projects', {
          method: 'POST',
          body: JSON.stringify({ name: 'Task Project' })
        })
      )) as NextRouteHandler<CreateProjectResponse>;

      expect(response.status).toBe(201);
      return response.json();
    })();

    const createdTaskResponse = (await createTask(
      authenticatedRequest(`/api/projects/${project.id}/tasks`, {
        method: 'POST',
        body: JSON.stringify({ title: 'Write integration tests' })
      }),
      { params: { projectId: project.id } }
    )) as NextRouteHandler<CreateTaskResponse>;

    expect(createdTaskResponse.status).toBe(201);
    const createdTask = (await createdTaskResponse.json()).task;

    const updatedTaskResponse = (await updateTask(
      authenticatedRequest(`/api/projects/${project.id}/tasks/${createdTask.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: true })
      }),
      {
        params: {
          projectId: project.id,
          taskId: createdTask.id
        }
      }
    )) as NextRouteHandler<CreateTaskResponse>;

    expect(updatedTaskResponse.status).toBe(200);
    const updatedTask = (await updatedTaskResponse.json()).task;
    expect(updatedTask.completed).toBe(true);

    const deletionResponse = (await removeTask(
      authenticatedRequest(`/api/projects/${project.id}/tasks/${createdTask.id}`, {
        method: 'DELETE'
      }),
      {
        params: {
          projectId: project.id,
          taskId: createdTask.id
        }
      }
    )) as NextRouteHandler;

    expect(deletionResponse.status).toBe(200);

    const projectDeletionResponse = (await deleteProject(
      authenticatedRequest(`/api/projects/${project.id}`, {
        method: 'DELETE'
      }),
      {
        params: {
          projectId: project.id
        }
      }
    )) as NextRouteHandler;

    expect(projectDeletionResponse.status).toBe(200);

    const listResponse = (await listProjects(authenticatedRequest('/api/projects'))) as NextRouteHandler<ListProjectsResponse>;
    const payload = await listResponse.json();
    expect(payload.projects).toHaveLength(0);
  });
});
