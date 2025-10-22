'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { logoutAction } from '@/actions/auth';
import { createProjectAction, deleteProjectAction, updateProjectAction } from '@/actions/projects';
import { createTaskAction, deleteTaskAction, updateTaskAction } from '@/actions/tasks';
import { projectFormSchema, type ProjectFormValues } from '@/schemas/project';
import {
  taskFormSchema,
  taskStatusValues,
  type TaskFormValues,
  type TaskStatusValue,
} from '@/schemas/task';

import type { ActionResult } from '@/actions/types';

type DashboardUser = {
  id: string;
  email: string;
  name: string | null;
};

type DashboardTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatusValue;
  createdAt: string;
  updatedAt: string;
};

type DashboardProject = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  tasks: DashboardTask[];
};

type DashboardShellProps = {
  user: DashboardUser;
  projects: DashboardProject[];
};

const inputStyles =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60';

const textareaStyles =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60';

const statusLabels: Record<TaskStatusValue, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

const taskStatusOrder = taskStatusValues;
const defaultTaskStatus: TaskStatusValue = taskStatusValues[0];

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const isActionSuccess = (result: ActionResult): result is { success: true } => 'success' in result;

export default function DashboardShell({ user, projects }: DashboardShellProps): JSX.Element {
  const router = useRouter();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isLoggingOut, startLogoutTransition] = useTransition();

  const handleLogout = (): void => {
    setLogoutError(null);
    startLogoutTransition(async () => {
      const result = await logoutAction();

      if (!isActionSuccess(result)) {
        setLogoutError(result.error);
        return;
      }

      router.push('/login');
      router.refresh();
    });
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
        <header className="flex flex-col gap-2 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold text-slate-900">Projects dashboard</h1>
            <p className="text-sm text-slate-600">
              Signed in as <span className="font-medium text-slate-800">{user.name ?? user.email}</span>
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? 'Signing out…' : 'Sign out'}
            </button>
            {logoutError ? <p className="text-sm text-rose-600">{logoutError}</p> : null}
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_3fr)]">
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Create a new project</h2>
              <ProjectForm mode="create" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-lg font-semibold text-slate-900">Your projects</h2>
              <p className="text-sm text-slate-600">
                Projects you create will appear below. Use the actions on each card to manage tasks.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                <p className="text-sm">
                  You haven&apos;t created any projects yet. Get started by adding your first project.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

type ProjectFormProps = {
  mode: 'create' | 'edit';
  project?: DashboardProject;
  onSuccess?: () => void;
};

function ProjectForm({ mode, project, onSuccess }: ProjectFormProps): JSX.Element {
  const isEdit = mode === 'edit';
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project?.name ?? '',
      description: project?.description ?? '',
    },
  });

  const onSubmit = (values: ProjectFormValues): void => {
    setServerError(null);

    startTransition(async () => {
      const result = isEdit
        ? await updateProjectAction({
            id: project!.id,
            ...values,
          })
        : await createProjectAction(values);

      if (!isActionSuccess(result)) {
        setServerError(result.error);
        return;
      }

      router.refresh();

      if (!isEdit) {
        reset();
      }

      onSuccess?.();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor={`project-name-${project?.id ?? 'new'}`} className="text-sm font-medium text-slate-700">
          Project name
        </label>
        <input
          id={`project-name-${project?.id ?? 'new'}`}
          type="text"
          placeholder="Project name"
          className={inputStyles}
          disabled={isPending}
          {...register('name')}
        />
        {errors.name ? <p className="text-sm text-rose-600">{errors.name.message}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor={`project-description-${project?.id ?? 'new'}`}
          className="text-sm font-medium text-slate-700"
        >
          Description
        </label>
        <textarea
          id={`project-description-${project?.id ?? 'new'}`}
          placeholder="What is this project about?"
          rows={3}
          className={textareaStyles}
          disabled={isPending}
          {...register('description')}
        />
        {errors.description ? <p className="text-sm text-rose-600">{errors.description.message}</p> : null}
      </div>

      {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? (isEdit ? 'Saving…' : 'Creating…') : isEdit ? 'Save changes' : 'Create project'}
        </button>
        {onSuccess && isEdit ? (
          <button
            type="button"
            onClick={onSuccess}
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

type ProjectCardProps = {
  project: DashboardProject;
};

function ProjectCard({ project }: ProjectCardProps): JSX.Element {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDelete = (): void => {
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteProjectAction({ id: project.id });
      if (!isActionSuccess(result)) {
        setDeleteError(result.error);
        return;
      }

      router.refresh();
    });
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-6">
        {isEditing ? (
          <ProjectForm
            mode="edit"
            project={project}
            onSuccess={() => {
              setIsEditing(false);
            }}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{project.name}</h3>
                  {project.description ? (
                    <p className="text-sm text-slate-600">{project.description}</p>
                  ) : (
                    <p className="text-sm italic text-slate-400">No description provided.</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 shadow-sm transition hover:bg-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isDeleting ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Created {formatDate(project.createdAt)} · Updated {formatDate(project.updatedAt)}
              </p>
            </div>
          </div>
        )}

        {deleteError ? <p className="text-sm text-rose-600">{deleteError}</p> : null}
      </div>

      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Tasks</h4>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsAddingTask((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary shadow-sm transition hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {isAddingTask ? 'Close form' : 'Add task'}
            </button>
          ) : null}
        </div>

        {isAddingTask ? (
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <TaskForm
              mode="create"
              projectId={project.id}
              onSuccess={() => {
                setIsAddingTask(false);
              }}
            />
          </div>
        ) : null}

        {project.tasks.length === 0 ? (
          <p className="text-sm italic text-slate-400">No tasks yet for this project.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {project.tasks.map((task) => (
              <TaskItem key={task.id} task={task} projectId={project.id} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

type TaskFormProps = {
  mode: 'create' | 'edit';
  projectId: string;
  task?: DashboardTask;
  onSuccess?: () => void;
};

function TaskForm({ mode, projectId, task, onSuccess }: TaskFormProps): JSX.Element {
  const isEdit = mode === 'edit';
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? defaultTaskStatus,
    },
  });

  const onSubmit = (values: TaskFormValues): void => {
    setServerError(null);

    startTransition(async () => {
      const result = isEdit
        ? await updateTaskAction({
            id: task!.id,
            ...values,
          })
        : await createTaskAction({
            projectId,
            ...values,
          });

      if (!isActionSuccess(result)) {
        setServerError(result.error);
        return;
      }

      router.refresh();

      if (!isEdit) {
        reset({ title: '', description: '', status: defaultTaskStatus });
      }

      onSuccess?.();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor={`task-title-${task?.id ?? 'new'}`} className="text-sm font-medium text-slate-700">
          Task title
        </label>
        <input
          id={`task-title-${task?.id ?? 'new'}`}
          type="text"
          placeholder="Task title"
          className={inputStyles}
          disabled={isPending}
          {...register('title')}
        />
        {errors.title ? <p className="text-sm text-rose-600">{errors.title.message}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`task-description-${task?.id ?? 'new'}`} className="text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id={`task-description-${task?.id ?? 'new'}`}
          placeholder="Add a short description"
          rows={3}
          className={textareaStyles}
          disabled={isPending}
          {...register('description')}
        />
        {errors.description ? <p className="text-sm text-rose-600">{errors.description.message}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`task-status-${task?.id ?? 'new'}`} className="text-sm font-medium text-slate-700">
          Status
        </label>
        <select
          id={`task-status-${task?.id ?? 'new'}`}
          className={inputStyles}
          disabled={isPending}
          {...register('status')}
        >
          {taskStatusOrder.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
        {errors.status ? <p className="text-sm text-rose-600">{errors.status.message}</p> : null}
      </div>

      {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? (isEdit ? 'Saving…' : 'Creating…') : isEdit ? 'Save changes' : 'Create task'}
        </button>
        {onSuccess && isEdit ? (
          <button
            type="button"
            onClick={onSuccess}
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

type TaskItemProps = {
  task: DashboardTask;
  projectId: string;
};

function TaskItem({ task, projectId }: TaskItemProps): JSX.Element {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = (): void => {
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteTaskAction({ id: task.id });
      if (!isActionSuccess(result)) {
        setDeleteError(result.error);
        return;
      }

      router.refresh();
    });
  };

  if (isEditing) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <TaskForm
          mode="edit"
          projectId={projectId}
          task={task}
          onSuccess={() => {
            setIsEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/60 p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h5 className="text-base font-semibold text-slate-900">{task.title}</h5>
          {task.description ? (
            <p className="text-sm text-slate-600">{task.description}</p>
          ) : (
            <p className="text-sm italic text-slate-400">No description provided.</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {statusLabels[task.status]}
          </span>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 shadow-sm transition hover:bg-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-400">
        Created {formatDate(task.createdAt)} · Updated {formatDate(task.updatedAt)}
      </p>
      {deleteError ? <p className="text-sm text-rose-600">{deleteError}</p> : null}
    </div>
  );
}
