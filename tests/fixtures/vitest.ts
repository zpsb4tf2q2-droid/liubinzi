import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";

import { DemoSeedResult, resetDatabase, seedDemoData } from "../../prisma/seed-data";

/**
 * Import this module at the top of a Vitest suite to receive a fully seeded
 * database and Prisma client via the test context:
 *
 * ```ts
 * import "../fixtures/vitest";
 *
 * test("lists seeded projects", async ({ prisma, seed }) => {
 *   const projects = await prisma.project.findMany();
 *   expect(projects).toHaveLength(Object.keys(seed.projects).length);
 * });
 * ```
 */
const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async (context) => {
  await resetDatabase(prisma);
  const seed = await seedDemoData(prisma);

  context.prisma = prisma;
  context.seed = seed;
});

afterEach(async () => {
  await resetDatabase(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

declare module "vitest" {
  export interface TestContext {
    prisma: PrismaClient;
    seed: DemoSeedResult;
  }
}

export { prisma };
export type { DemoSeedResult };
