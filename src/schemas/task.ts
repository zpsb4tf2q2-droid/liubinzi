import { z } from 'zod';

export const taskStatusValues = ['TODO', 'IN_PROGRESS', 'DONE'] as const;
export type TaskStatusValue = (typeof taskStatusValues)[number];

export const taskFormSchema = z.object({
  title: z
    .string({ required_error: 'Task title is required.' })
    .trim()
    .min(2, 'Task title must be at least 2 characters long.')
    .max(120, 'Task title must be 120 characters or fewer.'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be 500 characters or fewer.')
    .optional()
    .or(z.literal(''))
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
  status: z.enum(taskStatusValues, {
    required_error: 'Please select a task status.',
  }),
});

export const taskCreateSchema = taskFormSchema.extend({
  projectId: z.string().uuid('A valid project identifier is required.'),
});

export const taskUpdateSchema = taskFormSchema.extend({
  id: z.string().uuid('A valid task identifier is required.'),
});

export const taskDeleteSchema = z.object({
  id: z.string().uuid('A valid task identifier is required.'),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type TaskDeleteInput = z.infer<typeof taskDeleteSchema>;
