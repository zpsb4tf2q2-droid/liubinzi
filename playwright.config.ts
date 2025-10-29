import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    headless: true
  },
  globalSetup: require.resolve('./playwright/global-setup'),
  webServer: {
    command: 'pnpm run serve:test',
    url: 'http://127.0.0.1:3000/health',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000
  }
});
