import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEST_USER_EMAIL = 'e2e-user@example.com';

test.beforeEach(async () => {
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test('user can sign in and complete a project/task workflow', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('cta-dashboard').click();
  await page.waitForURL('**/dashboard');

  await page.getByTestId('login-email').fill(TEST_USER_EMAIL);
  await page.getByTestId('login-submit').click();

  await expect(page.getByText(`Welcome, ${TEST_USER_EMAIL}`)).toBeVisible();

  await page.getByTestId('project-name').fill('Launch Project');
  await page.getByTestId('create-project').click();

  const projectCard = page.locator('[data-testid^="project-card-"]').filter({ hasText: 'Launch Project' });
  await expect(projectCard).toHaveCount(1);
  await expect(projectCard.getByText('0% complete')).toBeVisible();

  const taskInput = projectCard.locator('[data-testid^="task-input-"]');
  await taskInput.fill('Write documentation');
  await projectCard.locator('[data-testid^="task-create-"]').click();

  const taskItem = projectCard.locator('[data-testid^="task-item-"]').filter({ hasText: 'Write documentation' });
  await expect(taskItem).toHaveCount(1);

  const toggleButton = projectCard.locator('[data-testid^="task-toggle-"]').first();
  await toggleButton.click();
  await expect(projectCard.getByText('100% complete')).toBeVisible();
  await expect(toggleButton).toHaveText('Mark incomplete');

  await projectCard.locator('[data-testid^="task-delete-"]').click();
  await expect(projectCard.locator('[data-testid^="task-item-"]')).toHaveCount(0);
  await expect(projectCard.getByText('0% complete')).toBeVisible();

  await projectCard.locator('[data-testid^="project-delete-"]').click();
  await expect(projectCard).toHaveCount(0);

  await page.getByTestId('logout').click();
  await expect(page.getByText('Sign in with your email to manage your projects.')).toBeVisible();
});
