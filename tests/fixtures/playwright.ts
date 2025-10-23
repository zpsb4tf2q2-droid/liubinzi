import { test as base } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

import { DemoSeedResult, resetDatabase, seedDemoData } from "../../prisma/seed-data";

/**
 * Extend Playwright's base test with Prisma-powered fixtures. Import this file
 * and re-export `test`/`expect` from it inside your test suite:
 *
 * ```ts
 * import { test, expect } from "../fixtures/playwright";
 *
 * test("dashboard shows seeded tasks", async ({ page, seed }) => {
 *   await page.goto("/dashboard");
 *   await expect(page.getByText(seed.tasks.wireframes.title)).toBeVisible();
 * });
 * ```
 */
const test = base.extend<{ prisma: PrismaClient; seed: DemoSeedResult }>({
  prisma: async ({}, use) => {
    const prisma = new PrismaClient();
    await prisma.$connect();

    try {
      await use(prisma);
    } finally {
      await prisma.$disconnect();
    }
  },
  seed: async ({ prisma }, use) => {
    await resetDatabase(prisma);
    const seeded = await seedDemoData(prisma);

    try {
      await use(seeded);
    } finally {
      await resetDatabase(prisma);
    }
  },
});

const expect = test.expect;

export { expect, test };
