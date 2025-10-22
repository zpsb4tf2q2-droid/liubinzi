import { z } from 'zod';

export const projectFormSchema = z.object({
  name: z
    .string({ required_error: 'Project name is required.' })
    .trim()
    .min(2, 'Project name must be at least 2 characters long.')
    .max(100, 'Project name must be 100 characters or fewer.'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be 500 characters or fewer.')
    .optional()
    .or(z.literal(''))
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
});

export const projectCreateSchema = projectFormSchema;

export const projectUpdateSchema = projectFormSchema.extend({
  id: z.string().uuid('A valid project identifier is required.'),
});

export const projectDeleteSchema = z.object({
  id: z.string().uuid('A valid project identifier is required.'),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type ProjectDeleteInput = z.infer<typeof projectDeleteSchema>;
