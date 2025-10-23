import { describe, expect, it } from 'vitest';

import { createProjectSchema, createTaskSchema, loginSchema, updateTaskSchema } from '@/validation/project';

describe('validation schemas', () => {
  it('validates login payload', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', name: 'Test User' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid login payload', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('validates project payload', () => {
    const payload = createProjectSchema.parse({ name: 'New Product Rollout' });
    expect(payload.name).toBe('New Product Rollout');
  });

  it('rejects too-short project name', () => {
    const result = createProjectSchema.safeParse({ name: 'aa' });
    expect(result.success).toBe(false);
  });

  it('validates task creation payload', () => {
    const payload = createTaskSchema.parse({ title: 'Ship MVP' });
    expect(payload.title).toBe('Ship MVP');
  });

  it('validates task updates require at least one field', () => {
    const result = updateTaskSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('allows updating either title or completed flag', () => {
    expect(updateTaskSchema.parse({ completed: true }).completed).toBe(true);
    expect(updateTaskSchema.parse({ title: 'Updated' }).title).toBe('Updated');
  });
});
