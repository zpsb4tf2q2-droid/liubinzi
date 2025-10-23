import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('A valid email is required'),
  name: z
    .string()
    .min(1, 'Name must contain at least 1 character')
    .max(100, 'Name must be at most 100 characters')
    .optional()
});

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Project name must have at least 3 characters')
    .max(80, 'Project name must have at most 80 characters')
});

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Task title must have at least 3 characters')
    .max(120, 'Task title must have at most 120 characters')
});

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, 'Task title must have at least 3 characters')
      .max(120, 'Task title must have at most 120 characters')
      .optional(),
    completed: z.boolean().optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one property must be provided to update a task'
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
