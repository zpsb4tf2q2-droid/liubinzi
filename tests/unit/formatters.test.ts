import { describe, expect, it } from 'vitest';

import { calculateCompletionPercentage, formatProjectName } from '@/utils/formatters';

describe('formatProjectName', () => {
  it('normalizes extra whitespace and capitalizes each word', () => {
    expect(formatProjectName('   launch    plan  ')).toBe('Launch Plan');
  });

  it('returns an empty string when provided only whitespace', () => {
    expect(formatProjectName('   ')).toBe('');
  });
});

describe('calculateCompletionPercentage', () => {
  it('returns 0 when there are no tasks', () => {
    expect(calculateCompletionPercentage([])).toBe(0);
  });

  it('returns the percentage of completed tasks rounded to the nearest integer', () => {
    const result = calculateCompletionPercentage([
      { completed: true },
      { completed: false },
      { completed: true }
    ]);

    expect(result).toBe(67);
  });
});
