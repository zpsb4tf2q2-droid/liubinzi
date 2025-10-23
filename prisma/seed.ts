import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {
      name: 'Demo User'
    },
    create: {
      email: 'demo@example.com',
      name: 'Demo User'
    }
  });

  const existingProject = await prisma.project.findFirst({
    where: {
      ownerId: user.id,
      name: 'Launch Plan'
    }
  });

  if (!existingProject) {
    const project = await prisma.project.create({
      data: {
        name: 'Launch Plan',
        ownerId: user.id
      }
    });

    await prisma.task.createMany({
      data: [
        {
          title: 'Define product scope',
          projectId: project.id
        },
        {
          title: 'Prepare launch campaign',
          projectId: project.id,
          completed: true
        }
      ]
    });
  }
}

main()
  .then(() => {
    console.log('Database seeded with demo data');
  })
  .catch((error) => {
    console.error('Error seeding database', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
