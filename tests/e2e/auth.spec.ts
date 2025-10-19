import { test, expect } from '@playwright/test';

// Ensure the "protected" route redirects to login when not authenticated
// Then perform a successful login and assert protected content is visible

test('redirect to login and successful login flow', async ({ page }) => {
  // Visit protected page; should redirect to /login
  const response = await page.goto('/protected');
  // After navigation, expect that current URL is /login with next parameter
  await expect(page).toHaveURL(/\/login\?next=%2Fprotected/);

  // Fill in the login form and submit
  await page.getByLabel('Username').fill('demo');
  await page.getByLabel('Password').fill('demo');
  await page.getByRole('button', { name: /sign in/i }).click();

  // Should land on protected page
  await expect(page).toHaveURL('/protected');
  await expect(page.getByRole('heading', { name: 'Protected Content' })).toBeVisible();
});
