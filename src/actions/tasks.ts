'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  taskCreateSchema,
  taskDeleteSchema,
  taskUpdateSchema,
  type TaskCreateInput,
  type TaskDeleteInput,
  type TaskUpdateInput,
} from '@/schemas/task';

import type { ActionResult } from './types';

const DASHBOARD_PATH = '/dashboard';

export const createTaskAction = async (values: TaskCreateInput): Promise<ActionResult> => {
  const parsed = taskCreateSchema.safeParse(values);

  if (!parsed.success) {
    return { error: 'Invalid task details provided.' };
  }

  const user = await getCurrentUser();

  if (!user) {
    return { error: 'You must be signed in to manage tasks.' };
  }

  const project = await prisma.project.findFirst({
    where: {
      id: parsed.data.projectId,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!project) {
    return { error: 'Project not found or you do not have permission to add tasks to it.' };
  }

  try {
    await prisma.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        status: parsed.data.status,
        projectId: parsed.data.projectId,
      },
    });

    revalidatePath(DASHBOARD_PATH);
    return { success: true };
  } catch (error) {
    console.error('Failed to create task', error);
    return { error: 'Unable to create task. Please try again.' };
  }
};

export const updateTaskAction = async (values: TaskUpdateInput): Promise<ActionResult> => {
  const parsed = taskUpdateSchema.safeParse(values);

  if (!parsed.success) {
    return { error: 'Invalid task details provided.' };
  }

  const user = await getCurrentUser();

  if (!user) {
    return { error: 'You must be signed in to manage tasks.' };
  }

  try {
    const { count } = await prisma.task.updateMany({
      where: {
        id: parsed.data.id,
        project: {
          userId: user.id,
        },
      },
      data: {
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        status: parsed.data.status,
      },
    });

    if (count === 0) {
      return { error: 'Task not found or you do not have permission to update it.' };
    }

    revalidatePath(DASHBOARD_PATH);
    return { success: true };
  } catch (error) {
    console.error('Failed to update task', error);
    return { error: 'Unable to update task. Please try again.' };
  }
};

export const deleteTaskAction = async (values: TaskDeleteInput): Promise<ActionResult> => {
  const parsed = taskDeleteSchema.safeParse(values);

  if (!parsed.success) {
    return { error: 'Invalid task identifier provided.' };
  }

  const user = await getCurrentUser();

  if (!user) {
    return { error: 'You must be signed in to manage tasks.' };
  }

  try {
    const { count } = await prisma.task.deleteMany({
      where: {
        id: parsed.data.id,
        project: {
          userId: user.id,
        },
      },
    });

    if (count === 0) {
      return { error: 'Task not found or you do not have permission to delete it.' };
    }

    revalidatePath(DASHBOARD_PATH);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete task', error);
    return { error: 'Unable to delete task. Please try again.' };
  }
};
