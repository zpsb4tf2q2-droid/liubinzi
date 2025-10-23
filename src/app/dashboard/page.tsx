'use client';

import { useCallback, useEffect, useMemo, useState, FormEvent } from 'react';

import { calculateCompletionPercentage, formatProjectName } from '@/utils/formatters';

type User = {
  id: string;
  email: string;
  name: string | null;
};

type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

type Project = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
};

const initialMessage = 'Sign in with your email to manage your projects.';

export default function DashboardPage(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState('');
  const [taskDrafts, setTaskDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string>(initialMessage);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetForms = useCallback(() => {
    setProjectName('');
    setTaskDrafts({});
  }, []);

  const fetchProjects = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/projects', {
        headers: {
          'x-user-id': user.id
        }
      });

      if (!response.ok) {
        throw new Error('Unable to load projects');
      }

      const data = (await response.json()) as { projects: Project[] };
      setProjects(data.projects);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unexpected error retrieving projects');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      void fetchProjects();
    } else {
      setProjects([]);
    }
  }, [user, fetchProjects]);

  const handleLogin = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({ email, name: name || undefined })
        });

        if (!response.ok) {
          const payload = await response.json();
          throw new Error(payload?.message ?? 'Unable to sign in');
        }

        const data = (await response.json()) as { user: User };
        setUser(data.user);
        setMessage(`Welcome, ${data.user.email}`);
        setEmail('');
        setName('');
      } catch (loginError) {
        setError(loginError instanceof Error ? loginError.message : 'Unable to sign in');
      } finally {
        setIsLoading(false);
      }
    },
    [email, name]
  );

  const updateTaskDraft = useCallback((projectId: string, value: string) => {
    setTaskDrafts((prev) => ({ ...prev, [projectId]: value }));
  }, []);

  const getHeaders = useCallback(() => {
    if (!user) return {};
    return {
      'content-type': 'application/json',
      'x-user-id': user.id
    } satisfies HeadersInit;
  }, [user]);

  const handleCreateProject = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ name: projectName })
        });

        if (!response.ok) {
          const payload = await response.json();
          throw new Error(payload?.message ?? 'Unable to create project');
        }

        setProjectName('');
        await fetchProjects();
      } catch (createError) {
        setError(createError instanceof Error ? createError.message : 'Unable to create project');
      } finally {
        setIsLoading(false);
      }
    },
    [user, getHeaders, projectName, fetchProjects]
  );

  const handleCreateTask = useCallback(
    async (projectId: string) => {
      if (!user) return;
      const title = taskDrafts[projectId];
      if (!title) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/projects/${projectId}/tasks`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ title })
        });

        if (!response.ok) {
          const payload = await response.json();
          throw new Error(payload?.message ?? 'Unable to create task');
        }

        updateTaskDraft(projectId, '');
        await fetchProjects();
      } catch (createError) {
        setError(createError instanceof Error ? createError.message : 'Unable to create task');
      } finally {
        setIsLoading(false);
      }
    },
    [user, getHeaders, taskDrafts, fetchProjects, updateTaskDraft]
  );

  const handleToggleTask = useCallback(
    async (projectId: string, taskId: string, completed: boolean) => {
      if (!user) return;

      setError(null);

      try {
        const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({ completed })
        });

        if (!response.ok) {
          const payload = await response.json();
          throw new Error(payload?.message ?? 'Unable to update task');
        }

        await fetchProjects();
      } catch (updateError) {
        setError(updateError instanceof Error ? updateError.message : 'Unable to update task');
      }
    },
    [user, getHeaders, fetchProjects]
  );

  const handleDeleteTask = useCallback(
    async (projectId: string, taskId: string) => {
      if (!user) return;

      setError(null);

      try {
        const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
          method: 'DELETE',
          headers: getHeaders()
        });

        if (!response.ok) {
          const payload = await response.json();
          throw new Error(payload?.message ?? 'Unable to delete task');
        }

        await fetchProjects();
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete task');
      }
    },
    [user, getHeaders, fetchProjects]
  );

  const handleDeleteProject = useCallback(
    async (projectId: string) => {
      if (!user) return;

      setError(null);

      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
          headers: getHeaders()
        });

        if (!response.ok) {
          const payload = await response.json();
          throw new Error(payload?.message ?? 'Unable to delete project');
        }

        await fetchProjects();
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete project');
      }
    },
    [user, getHeaders, fetchProjects]
  );

  const sortedProjects = useMemo(
    () =>
      [...projects].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [projects]
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Project Dashboard</h1>
        <p className="text-slate-600">{message}</p>
      </header>

      {!user ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <div className="flex flex-col text-left">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                data-testid="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex flex-col text-left">
              <label className="text-sm font-medium text-slate-700" htmlFor="name">
                Name (optional)
              </label>
              <input
                id="name"
                data-testid="login-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              data-testid="login-submit"
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-75"
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </section>
      ) : (
        <section className="flex flex-col gap-8">
          <form
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            onSubmit={handleCreateProject}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex w-full flex-col md:flex-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="project-name">
                  Project name
                </label>
                <input
                  id="project-name"
                  data-testid="project-name"
                  type="text"
                  required
                  value={projectName}
                  onChange={(event) => setProjectName(formatProjectName(event.target.value))}
                  className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <button
                data-testid="create-project"
                type="submit"
                disabled={isLoading || !projectName}
                className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-75 md:w-auto"
              >
                {isLoading ? 'Saving…' : 'Create project'}
              </button>
            </div>
          </form>

          <div className="flex flex-col gap-6">
            {sortedProjects.length === 0 ? (
              <p className="text-center text-sm text-slate-500">Create your first project to get started.</p>
            ) : null}

            {sortedProjects.map((project) => {
              const completion = calculateCompletionPercentage(project.tasks);
              const draftValue = taskDrafts[project.id] ?? '';

              return (
                <article
                  key={project.id}
                  data-testid={`project-card-${project.id}`}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{project.name}</h2>
                      <p className="text-sm text-slate-500">{completion}% complete</p>
                    </div>
                    <button
                      type="button"
                      data-testid={`project-delete-${project.id}`}
                      onClick={() => handleDeleteProject(project.id)}
                      className="inline-flex items-center justify-center rounded-md border border-red-200 px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Delete project
                    </button>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {project.tasks.map((task) => (
                      <li
                        key={task.id}
                        data-testid={`task-item-${task.id}`}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                      >
                        <span className={task.completed ? 'text-slate-500 line-through' : 'text-slate-700'}>
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            data-testid={`task-toggle-${task.id}`}
                            onClick={() => handleToggleTask(project.id, task.id, !task.completed)}
                            className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                          >
                            {task.completed ? 'Mark incomplete' : 'Mark complete'}
                          </button>
                          <button
                            type="button"
                            data-testid={`task-delete-${task.id}`}
                            onClick={() => handleDeleteTask(project.id, task.id)}
                            className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
                    <div className="flex w-full flex-col md:flex-1">
                      <label className="text-sm font-medium text-slate-700" htmlFor={`task-${project.id}`}>
                        New task
                      </label>
                      <input
                        id={`task-${project.id}`}
                        data-testid={`task-input-${project.id}`}
                        type="text"
                        value={draftValue}
                        onChange={(event) => updateTaskDraft(project.id, event.target.value)}
                        className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <button
                      type="button"
                      data-testid={`task-create-${project.id}`}
                      onClick={() => handleCreateTask(project.id)}
                      disabled={!draftValue}
                      className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-75 md:w-auto"
                    >
                      Add task
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {user ? (
        <button
          type="button"
          data-testid="logout"
          onClick={() => {
            setUser(null);
            resetForms();
            setMessage(initialMessage);
            setError(null);
          }}
          className="mt-auto inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Sign out
        </button>
      ) : null}
    </main>
  );
}
