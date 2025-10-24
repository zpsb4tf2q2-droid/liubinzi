import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";

export default defineConfig({
  testDir: "apps/web/tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `pnpm --filter web dev --port ${PORT} --hostname ${HOST}`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "test-secret",
      NEXTAUTH_URL: `http://127.0.0.1:${PORT}`,
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? "Playwright App",
      NEXT_PUBLIC_API_BASE_URL: `http://127.0.0.1:${PORT}/api`,
      BACKEND_API_URL: process.env.BACKEND_API_URL ?? "http://127.0.0.1:3333",
      EMAIL_FROM: process.env.EMAIL_FROM ?? "playwright@example.com",
    },
  },
});
