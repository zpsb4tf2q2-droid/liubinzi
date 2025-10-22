import { PrismaClient, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {
      name: "Demo User",
    },
    create: {
      email: "demo@example.com",
      name: "Demo User",
    },
  });

  await prisma.project.upsert({
    where: { id: "demo-project" },
    update: {
      name: "Demo Project",
      description: "A sample project seeded for development.",
    },
    create: {
      id: "demo-project",
      name: "Demo Project",
      description: "A sample project seeded for development.",
      ownerId: demoUser.id,
    },
  });

  await prisma.task.upsert({
    where: { id: "demo-task-1" },
    update: {
      status: TaskStatus.DONE,
    },
    create: {
      id: "demo-task-1",
      title: "Review project requirements",
      description: "Understand the scope of the demo project.",
      status: TaskStatus.DONE,
      projectId: "demo-project",
    },
  });

  await prisma.task.upsert({
    where: { id: "demo-task-2" },
    update: {
      status: TaskStatus.IN_PROGRESS,
    },
    create: {
      id: "demo-task-2",
      title: "Implement initial features",
      description: "Work on initial demo project tasks.",
      status: TaskStatus.IN_PROGRESS,
      projectId: "demo-project",
    },
  });
}

main()
  .then(() => {
    console.log("Database seeded with demo data");
  })
  .catch((error) => {
    console.error("Error seeding database", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
