import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    trace: "retain-on-failure",
  },
});
