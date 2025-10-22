import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address.'),
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters long.')
    .max(64, 'Name must be 64 characters or fewer.')
    .optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
