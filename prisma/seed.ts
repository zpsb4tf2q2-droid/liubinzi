import { PrismaClient, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {
      name: "Demo User",
    },
    create: {
      email: "demo@example.com",
      name: "Demo User",
    },
  });

  const existingProjects = await prisma.project.count({
    where: { userId: user.id },
  });

  if (existingProjects === 0) {
    await prisma.project.create({
      data: {
        name: "Launch Website",
        description: "Plan, build, and launch a marketing site for the new product.",
        userId: user.id,
        tasks: {
          create: [
            {
              title: "Design landing page",
              description: "Create high-fidelity designs for the hero and key sections.",
              status: TaskStatus.IN_PROGRESS,
            },
            {
              title: "Implement CMS integration",
              description: "Connect the marketing site to the headless CMS content model.",
              status: TaskStatus.TODO,
            },
            {
              title: "Publish release notes",
              description: "Collaborate with product marketing to craft release messaging.",
              status: TaskStatus.DONE,
            },
          ],
        },
      },
    });
  }
}

main()
  .then(() => {
    console.log("Database seeded with demo user and sample project");
  })
  .catch((error) => {
    console.error("Error seeding database", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
