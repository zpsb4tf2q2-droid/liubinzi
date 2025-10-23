export function formatProjectName(name: string): string {
  const normalized = name.trim().replace(/\s+/g, ' ');

  if (!normalized) {
    return '';
  }

  return normalized
    .toLowerCase()
    .split(' ')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export type CompletionSource = {
  completed: boolean;
};

export function calculateCompletionPercentage<T extends CompletionSource>(items: T[]): number {
  if (items.length === 0) {
    return 0;
  }

  const completedCount = items.filter((item) => item.completed).length;
  const percentage = (completedCount / items.length) * 100;

  return Math.round(percentage);
}
