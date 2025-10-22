import { PrismaClient, ProjectStatus, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
    },
  });

  await prisma.task.deleteMany({ where: { userId: demoUser.id } });
  await prisma.project.deleteMany({ where: { userId: demoUser.id } });

  const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "Refreshing the marketing website to align with new branding.",
      status: ProjectStatus.ACTIVE,
      userId: demoUser.id,
      tasks: {
        create: [
          {
            title: "Audit existing pages",
            description: "Review current site content and identify outdated sections.",
            status: TaskStatus.IN_PROGRESS,
            dueDate: threeDaysFromNow,
            userId: demoUser.id,
          },
          {
            title: "Prepare design mockups",
            description: "Collaborate with design to produce updated page layouts.",
            status: TaskStatus.TODO,
            dueDate: oneWeekFromNow,
            userId: demoUser.id,
          },
        ],
      },
    },
  });

  await prisma.project.create({
    data: {
      name: "Onboarding Flow Improvements",
      description: "Streamlining the product onboarding experience for new users.",
      status: ProjectStatus.PLANNED,
      userId: demoUser.id,
      tasks: {
        create: [
          {
            title: "Document current onboarding funnel",
            description: "Capture each step a user takes from sign-up to first value.",
            status: TaskStatus.TODO,
            dueDate: oneWeekFromNow,
            userId: demoUser.id,
          },
          {
            title: "Prototype guided setup",
            description: "Design a guided checklist to help users finish key actions.",
            status: TaskStatus.BLOCKED,
            dueDate: null,
            userId: demoUser.id,
          },
        ],
      },
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
