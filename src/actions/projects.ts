'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  projectCreateSchema,
  projectDeleteSchema,
  projectUpdateSchema,
  type ProjectCreateInput,
  type ProjectDeleteInput,
  type ProjectUpdateInput,
} from '@/schemas/project';

import type { ActionResult } from './types';

const DASHBOARD_PATH = '/dashboard';

export const createProjectAction = async (values: ProjectCreateInput): Promise<ActionResult> => {
  const parsed = projectCreateSchema.safeParse(values);

  if (!parsed.success) {
    return { error: 'Invalid project details provided.' };
  }

  const user = await getCurrentUser();

  if (!user) {
    return { error: 'You must be signed in to manage projects.' };
  }

  try {
    await prisma.project.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        userId: user.id,
      },
    });

    revalidatePath(DASHBOARD_PATH);
    return { success: true };
  } catch (error) {
    console.error('Failed to create project', error);
    return { error: 'Unable to create project. Please try again.' };
  }
};

export const updateProjectAction = async (values: ProjectUpdateInput): Promise<ActionResult> => {
  const parsed = projectUpdateSchema.safeParse(values);

  if (!parsed.success) {
    return { error: 'Invalid project details provided.' };
  }

  const user = await getCurrentUser();

  if (!user) {
    return { error: 'You must be signed in to manage projects.' };
  }

  try {
    const { count } = await prisma.project.updateMany({
      where: {
        id: parsed.data.id,
        userId: user.id,
      },
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
      },
    });

    if (count === 0) {
      return { error: 'Project not found or you do not have permission to update it.' };
    }

    revalidatePath(DASHBOARD_PATH);
    return { success: true };
  } catch (error) {
    console.error('Failed to update project', error);
    return { error: 'Unable to update project. Please try again.' };
  }
};

export const deleteProjectAction = async (values: ProjectDeleteInput): Promise<ActionResult> => {
  const parsed = projectDeleteSchema.safeParse(values);

  if (!parsed.success) {
    return { error: 'Invalid project identifier provided.' };
  }

  const user = await getCurrentUser();

  if (!user) {
    return { error: 'You must be signed in to manage projects.' };
  }

  try {
    const { count } = await prisma.project.deleteMany({
      where: {
        id: parsed.data.id,
        userId: user.id,
      },
    });

    if (count === 0) {
      return { error: 'Project not found or you do not have permission to delete it.' };
    }

    revalidatePath(DASHBOARD_PATH);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete project', error);
    return { error: 'Unable to delete project. Please try again.' };
  }
};
