import { expect, test, type Page } from '@playwright/test';
import { TEST_USER_CREDENTIALS } from '../../src/db/seed';

const createUniqueEmail = (): string => {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `playwright-user-${Date.now()}-${suffix}@example.com`;
};

const fillInput = async (page: Page, testId: string, value: string): Promise<void> => {
  await page.getByTestId(testId).fill(value);
};

test.describe('authentication flow', () => {
  test('allows signing up, logging in, and viewing the dashboard', async ({ page }) => {
    const password = 'Testing123!';
    const email = createUniqueEmail();
    const name = 'Playwright User';

    await page.goto('/');

    await fillInput(page, 'signup-name', name);
    await fillInput(page, 'signup-email', email);
    await fillInput(page, 'signup-password', password);
    await page.getByTestId('signup-submit').click();

    await expect(page.getByTestId('signup-message')).toHaveText(`Account created for ${name}`);

    await page.reload();

    await fillInput(page, 'login-email', email);
    await fillInput(page, 'login-password', password);
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-message')).toHaveText(`Welcome back, ${name}`);

    await page.getByTestId('dashboard-button').click();

    await expect(page.getByTestId('dashboard-message')).toHaveText(`Dashboard ready for ${name}`);
  });

  test('supports logging in with a seeded account', async ({ page }) => {
    await page.goto('/');

    await fillInput(page, 'login-email', TEST_USER_CREDENTIALS.email);
    await fillInput(page, 'login-password', TEST_USER_CREDENTIALS.password);
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-message')).toHaveText('Welcome back, Seeded Tester');

    await page.getByTestId('dashboard-button').click();

    await expect(page.getByTestId('dashboard-message')).toHaveText('Dashboard ready for Seeded Tester');
  });
});
