import { PrismaClient } from "@prisma/client";
import { resetDatabase, seedDemoData } from "./seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Resetting database before seeding...");
  await resetDatabase(prisma);

  const { users, projects, tasks } = await seedDemoData(prisma);

  console.log(
    `Database seeded with ${Object.keys(users).length} users, ${Object.keys(projects).length} projects, and ${Object.keys(tasks).length} tasks.`,
  );
}

main()
  .catch((error) => {
    console.error("Error seeding database", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
